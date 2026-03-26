import { useState, useEffect, useRef } from 'react';

export const generateTimeline = (config) => {
  const timeline = [];
  
  if (config.prepTime > 0) {
    timeline.push({ type: 'prep', name: '準備してね', duration: config.prepTime, set: 1 });
  }

  for (let s = 1; s <= config.sets; s++) {
    if (config.mode === 'interval') {
      timeline.push({ type: 'work', name: 'ファイト！', duration: config.workTime, set: s });
    } else if (config.mode === 'tempo') {
      for (let r = 1; r <= config.tempoReps; r++) {
        config.tempoPhases.forEach(phase => {
          timeline.push({ 
            type: 'work', 
            name: phase.name, 
            duration: phase.duration, 
            set: s, 
            rep: r,
            totalReps: config.tempoReps
          });
        });
      }
    }
    
    if (s < config.sets && config.restTime > 0) {
      timeline.push({ type: 'rest', name: '休憩してね', duration: config.restTime, set: s });
    }
  }
  
  return timeline;
};

export const useTimer = (config) => {
  const [timeline, setTimeline] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [status, setStatus] = useState('idle'); // idle, running, paused, finished
  
  const onTickRef = useRef(null);
  const onPhaseChangeRef = useRef(null);
  
  // Use a ref to access latest state inside setInterval and avoid stale closures
  const stateRef = useRef({ timeLeft: 0, currentIndex: 0, status: 'idle', timeline: [] });
  stateRef.current = { timeLeft, currentIndex, status, timeline };

  useEffect(() => {
    const newTimeline = generateTimeline(config);
    setTimeline(newTimeline);
    setCurrentIndex(0);
    if (newTimeline.length > 0) {
      setTimeLeft(newTimeline[0].duration);
    }
    setStatus('idle');
  }, [config]);

  // Main timer loop
  useEffect(() => {
    let intervalId;
    if (status === 'running') {
      intervalId = setInterval(() => {
        const { timeLeft, currentIndex, timeline } = stateRef.current;
        
        if (timeLeft > 0) {
          const nextTime = timeLeft - 1;
          setTimeLeft(nextTime);
          if (onTickRef.current) onTickRef.current(nextTime, timeline[currentIndex]);
        } else {
          // If we are at 0, transition to next phase
          if (currentIndex < timeline.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            setTimeLeft(timeline[nextIndex].duration);
            if (onPhaseChangeRef.current) onPhaseChangeRef.current(timeline[nextIndex]);
          } else {
            setStatus('finished');
            if (onPhaseChangeRef.current) onPhaseChangeRef.current({ type: 'finished', name: '完了' });
          }
        }
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [status]);

  const toggleTimer = () => {
    if (status === 'idle') {
      if (onPhaseChangeRef.current && timeline[currentIndex]) {
         onPhaseChangeRef.current({ ...timeline[currentIndex], isStart: true });
      }
    }
    setStatus(s => s === 'running' ? 'paused' : s === 'finished' ? 'finished' : 'running');
  };

  const resetTimer = () => {
    setCurrentIndex(0);
    if (timeline.length > 0) setTimeLeft(timeline[0].duration);
    setStatus('idle');
  };

  const skipForward = () => {
    if (currentIndex < timeline.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setTimeLeft(timeline[nextIndex].duration);
      if (onPhaseChangeRef.current) onPhaseChangeRef.current({...timeline[nextIndex], isSkip: true});
    } else {
      setStatus('finished');
      setTimeLeft(0);
    }
  };

  const skipBackward = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setTimeLeft(timeline[prevIndex].duration);
      if (onPhaseChangeRef.current) onPhaseChangeRef.current({...timeline[prevIndex], isSkip: true});
    } else {
      setTimeLeft(timeline[0]?.duration || 0);
    }
  };

  return {
    status,
    timeLeft,
    currentPhase: timeline[currentIndex] || null,
    totalSets: config.sets,
    toggleTimer,
    resetTimer,
    skipForward,
    skipBackward,
    onTick: (cb) => { onTickRef.current = cb; },
    onPhaseChange: (cb) => { onPhaseChangeRef.current = cb; }
  };
};
