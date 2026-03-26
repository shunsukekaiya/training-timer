import { useEffect, useRef, useState } from 'react';

export const useAudio = () => {
  const audioCtxRef = useRef(null);
  const bgmOscRef = useRef(null);
  const bgmGainRef = useRef(null);
  
  const [volumes, setVolumes] = useState({
    master: 0.8,
    bgm: 0.15,
    voice: 1.0,
    voiceEngine: 'anime'
  });

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtxRef.current = new AudioContext();
      
      bgmGainRef.current = audioCtxRef.current.createGain();
      bgmGainRef.current.connect(audioCtxRef.current.destination);
      bgmGainRef.current.gain.value = 0;
      
      bgmOscRef.current = audioCtxRef.current.createOscillator();
      bgmOscRef.current.type = 'sine';
      bgmOscRef.current.frequency.value = 110;
      bgmOscRef.current.connect(bgmGainRef.current);
      bgmOscRef.current.start();
    }
    
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  useEffect(() => {
    // ChromeのSystem Voiceをいち早くロードさせるためのおまじない
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    if (bgmGainRef.current && audioCtxRef.current) {
      // Only update if it's currently playing (gain > 0)
      if (bgmGainRef.current.gain.value > 0.01) {
        bgmGainRef.current.gain.setTargetAtTime(
          volumes.bgm * volumes.master,
          audioCtxRef.current.currentTime,
          0.1
        );
      }
    }
  }, [volumes]);

  const playBeep = (freq = 440, duration = 0.1) => {
    if (!audioCtxRef.current) return;
    const osc = audioCtxRef.current.createOscillator();
    const gain = audioCtxRef.current.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtxRef.current.destination);
    
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volumes.master * 0.5, audioCtxRef.current.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + duration);
    
    osc.start();
    osc.stop(audioCtxRef.current.currentTime + duration);
  };

  const speakSystem = (text, vol) => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = vol;
    utterance.rate = 1.0;
    utterance.lang = 'ja-JP';
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.lang.includes('ja') && (v.name.includes('Kyoko') || v.name.includes('Nanami') || v.name.includes('Premium')));
    const jaVoice = premiumVoice || voices.find(v => v.lang.includes('ja'));
    if (jaVoice) utterance.voice = jaVoice;
    window.speechSynthesis.speak(utterance);
  };

  const speakVoicevox = async (text, vol) => {
    // 四国めたん（ノーマル）: ID=2、かわいいアニメ女性ボイス
    const speakerId = 2;
    try {
      const queryRes = await fetch(
        `http://localhost:50021/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId}`,
        { method: 'POST' }
      );
      if (!queryRes.ok) throw new Error('audio_query failed');
      const query = await queryRes.json();

      const synthRes = await fetch(
        `http://localhost:50021/synthesis?speaker=${speakerId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(query),
        }
      );
      if (!synthRes.ok) throw new Error('synthesis failed');

      const blob = await synthRes.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = vol;
      await audio.play();
      audio.onended = () => URL.revokeObjectURL(url);
    } catch (e) {
      console.warn('VOICEVOX unavailable, falling back to system voice', e);
      speakSystem(text, vol);
    }
  };

  const speak = (text) => {
    const vol = volumes.voice * volumes.master;
    if (vol === 0) return;

    if (volumes.voiceEngine === 'voicevox') {
      speakVoicevox(text, vol);
    } else if (volumes.voiceEngine === 'google' || volumes.voiceEngine === 'anime') {
      try {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ja&client=tw-ob&q=${encodeURIComponent(text)}`;
        const audio = new Audio(url);

        if (volumes.voiceEngine === 'anime') {
          audio.preservesPitch = false;
          if ('webkitPreservesPitch' in audio) audio.webkitPreservesPitch = false;
          audio.playbackRate = 1.25;
        }
        audio.volume = vol;
        audio.play().catch(e => {
          console.warn("Google TTS Fallback", e);
          speakSystem(text, vol);
        });
      } catch(e) {
        speakSystem(text, vol);
      }
    } else {
      speakSystem(text, vol);
    }
  };

  const setBgmState = (state) => {
    if (!bgmGainRef.current || !audioCtxRef.current) return;
    const now = audioCtxRef.current.currentTime;
    
    if (state === 'work') {
      bgmOscRef.current.frequency.setTargetAtTime(110, now, 0.1);
      bgmOscRef.current.type = 'triangle';
      bgmGainRef.current.gain.setTargetAtTime(volumes.bgm * volumes.master, now, 0.5);
    } else {
      // トレーニング中以外（準備中、休憩中、一時停止中）は完全に無音にする
      bgmGainRef.current.gain.setTargetAtTime(0, now, 0.1);
    }
  };

  return {
    initAudio,
    playBeep,
    speak,
    setBgmState,
    volumes,
    setVolumes
  };
};
