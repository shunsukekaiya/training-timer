import React from 'react';
import { Slider } from './Slider';

export const AudioSettings = ({ volumes, setVolumes, speakText, playBeep, initAudio }) => {
  const handleTest = () => {
    if (initAudio) initAudio();
    // 優しい女の子風のテスト音声
    if (speakText) speakText('このくらいの声の大きさで案内するね！');
  };

  return (
    <div className="glass-panel flex-col gap-4" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="text-subtitle">音声機能の設定</h3>
        <button className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={handleTest}>
          🔊 音声テスト
        </button>
      </div>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
        ※音声が聞こえない場合は、一度「音声テスト」ボタンを押してください。<br/>
        ※マナーモードを解除し、メディア音量を確認してください。
      </p>
      <Slider 
        label="マスター音量"
        value={volumes.master}
        min={0}
        max={1}
        step={0.05}
        onChange={(v) => setVolumes(prev => ({...prev, master: v}))}
        formatValue={(v) => `${Math.round(v * 100)}%`}
      />
      <Slider 
        label="BGM音量"
        value={volumes.bgm}
        min={0}
        max={1}
        step={0.05}
        onChange={(v) => setVolumes(prev => ({...prev, bgm: v}))}
        formatValue={(v) => `${Math.round(v * 100)}%`}
      />
      <Slider 
        label="ガイダンス音量"
        value={volumes.voice}
        min={0}
        max={1}
        step={0.05}
        onChange={(v) => setVolumes(prev => ({...prev, voice: v}))}
        formatValue={(v) => `${Math.round(v * 100)}%`}
      />
      <div className="flex-col gap-2" style={{ marginTop: '0.5rem', width: '100%' }}>
        <span className="text-subtitle" style={{ fontSize: '0.9rem' }}>音声エンジン切替</span>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className="btn"
            style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', background: volumes.voiceEngine === 'voicevox' ? 'rgba(255,255,255,0.3)' : 'var(--glass-bg)' }}
            onClick={() => setVolumes(p => ({...p, voiceEngine: 'voicevox'}))}
          >
            かわいい(VOICEVOX)
          </button>
          <button
            className="btn"
            style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', background: volumes.voiceEngine === 'anime' ? 'rgba(255,255,255,0.3)' : 'var(--glass-bg)' }}
            onClick={() => setVolumes(p => ({...p, voiceEngine: 'anime'}))}
          >
            アニメ風(Google改)
          </button>
          <button
            className="btn"
            style={{ flex: 1, padding: '0.5rem', fontSize: '0.85rem', background: volumes.voiceEngine === 'system' ? 'rgba(255,255,255,0.3)' : 'var(--glass-bg)' }}
            onClick={() => setVolumes(p => ({...p, voiceEngine: 'system'}))}
          >
            標準(システム)
          </button>
        </div>
        {volumes.voiceEngine === 'voicevox' && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            ※VOICEVOXアプリを起動してから使用してください。<br/>
            未起動の場合は自動的に標準音声に切り替わります。
          </p>
        )}
      </div>
    </div>
  );
};
