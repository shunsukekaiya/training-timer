import React from 'react';
import { Slider } from './Slider';

export const PresetEditor = ({ config, onChange }) => {
  const updateConfig = (key, value) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="glass-panel flex-col gap-4" style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.2)' }}>
      <h3 className="text-subtitle">このプリセットの設定を調整</h3>
      <Slider 
        label="セット数" 
        value={config.sets || 1} 
        min={1} max={20} 
        onChange={v => updateConfig('sets', v)} 
      />
      
      {config.mode === 'interval' ? (
        <>
          <Slider 
            label="準備時間 (秒)" 
            value={config.prepTime || 10} 
            min={0} max={60} step={5}
            onChange={v => updateConfig('prepTime', v)} 
          />
          <Slider 
            label="運動時間 (秒)" 
            value={config.workTime || 20} 
            min={5} max={180} step={5}
            onChange={v => updateConfig('workTime', v)} 
          />
          <Slider 
            label="休憩時間 (秒)" 
            value={config.restTime || 10} 
            min={0} max={120} step={5}
            onChange={v => updateConfig('restTime', v)} 
          />
        </>
      ) : (
        <>
          <Slider 
            label="準備時間 (秒)" 
            value={config.prepTime || 10} 
            min={0} max={60} step={5}
            onChange={v => updateConfig('prepTime', v)} 
          />
          <Slider 
            label="動作回数 (Reps)" 
            value={config.tempoReps || 1} 
            min={1} max={50}
            onChange={v => updateConfig('tempoReps', v)} 
          />
          {config.tempoPhases.map((phase, idx) => (
            <Slider 
              key={idx}
              label={`${phase.name} (秒)`} 
              value={phase.duration} 
              min={1} max={20}
              onChange={v => {
                const newPhases = [...config.tempoPhases];
                newPhases[idx].duration = v;
                updateConfig('tempoPhases', newPhases);
              }} 
            />
          ))}
          <Slider 
            label="セット間休憩 (秒)" 
            value={config.restTime || 10} 
            min={0} max={120} step={5}
            onChange={v => updateConfig('restTime', v)} 
          />
        </>
      )}
    </div>
  );
};
