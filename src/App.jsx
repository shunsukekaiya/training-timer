import React, { useEffect, useState } from "react";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Settings,
  Check,
} from "lucide-react";
import { useTimer } from "./hooks/useTimer";
import { useAudio } from "./hooks/useAudio";
import { Button } from "./components/Button";
import { AudioSettings } from "./components/AudioSettings";
import { PresetEditor } from "./components/PresetEditor";

const PRESETS = [
  {
    id: "tabata",
    name: "タバタ式 (20s/10s)",
    config: {
      mode: "interval",
      sets: 8,
      prepTime: 10,
      workTime: 20,
      restTime: 10,
    },
  },
  {
    id: "hiit",
    name: "HIIT (40s/20s)",
    config: {
      mode: "interval",
      sets: 10,
      prepTime: 10,
      workTime: 40,
      restTime: 20,
    },
  },
  {
    id: "pilates",
    name: "ピラティス呼吸 (5s/5s)",
    config: {
      mode: "tempo",
      sets: 3,
      prepTime: 10,
      restTime: 10,
      tempoReps: 5,
      tempoPhases: [
        { name: "吸って", duration: 5 },
        { name: "吐いて", duration: 5 },
      ],
    },
  },
  {
    id: "squat",
    name: "スロースクワット (4s/4s)",
    config: {
      mode: "tempo",
      sets: 3,
      prepTime: 10,
      restTime: 30,
      tempoReps: 10,
      tempoPhases: [
        { name: "下げて", duration: 4 },
        { name: "上げて", duration: 4 },
      ],
    },
  },
];

function App() {
  const [activePreset, setActivePreset] = useState(PRESETS[0]);
  const [customConfig, setCustomConfig] = useState(PRESETS[0].config);
  const [showSettings, setShowSettings] = useState(false);

  const { initAudio, playBeep, speak, setBgmState, volumes, setVolumes } =
    useAudio();

  const timer = useTimer(customConfig);

  useEffect(() => {
    let wakeLock = null;
    const requestWakeLock = async () => {
      if ("wakeLock" in navigator) {
        try {
          wakeLock = await navigator.wakeLock.request("screen");
        } catch (err) {}
      }
    };

    if (timer.status === "running") {
      requestWakeLock();
    } else if (wakeLock) {
      wakeLock.release().then(() => {
        wakeLock = null;
      });
    }
  }, [timer.status]);

  useEffect(() => {
    timer.onTick((timeLeft, currentPhase) => {
      if (timeLeft <= 5 && timeLeft > 0) {
        // playBeep(880, 0.1);
        speak(timeLeft.toString());
      } else if (timeLeft === 0) {
        playBeep(1100, 0.3);
        speak("ゼロ");
      }
    });

    timer.onPhaseChange((phase) => {
      if (!phase) return;
      if (phase.type === "finished") {
        speak("トレーニング完了！お疲れ様！");
        playBeep(1100, 0.5);
        setBgmState("idle");
      } else {
        if (phase.isSkip) playBeep(660, 0.1);
        else playBeep(1100, 0.2);

        // Phase name spoken
        if (!phase.isStart) {
          speak(phase.name);
        }
        setBgmState(phase.type);
      }
    });
  }, [timer, playBeep, speak, setBgmState]);

  useEffect(() => {
    document.body.className = "";
    if (timer.status === "paused") {
      document.body.classList.add("state-pause");
      setBgmState("idle");
    } else if (timer.currentPhase) {
      document.body.classList.add(`state-${timer.currentPhase.type}`);
      if (timer.status === "running") setBgmState(timer.currentPhase.type);
    } else {
      document.body.classList.add("state-prep");
      setBgmState("idle");
    }
  }, [timer.status, timer.currentPhase, setBgmState]);

  const handleStart = () => {
    initAudio();
    if (timer.status === "idle") {
      speak("準備はいいかな？");
    }
    timer.toggleTimer();
  };

  const handlePresetChange = (preset) => {
    setActivePreset(preset);
    setCustomConfig(preset.config);
    timer.resetTimer();
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    if (m > 0) return `${m}:${s.toString().padStart(2, "0")}`;
    return s.toString();
  };

  return (
    <div
      className="flex-col"
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        padding: "1rem",
      }}
    >
      <header
        className="flex-center"
        style={{
          justifyContent: "space-between",
          padding: "1rem",
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>TrainerPro</h1>
        <Button variant="icon" onClick={() => setShowSettings(!showSettings)}>
          <Settings size={24} />
        </Button>
      </header>

      <main
        className="flex-col flex-center"
        style={{
          flex: 1,
          position: "relative",
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {showSettings && timer.status === "idle" && (
          <div
            className="glass-panel"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
              backdropFilter: "blur(30px)",
              overflowY: "auto",
            }}
          >
            <div className="flex-col gap-4">
              <h2 className="text-title" style={{ fontSize: "1.5rem" }}>
                プリセット選択
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    className="btn"
                    style={
                      p.id === activePreset.id
                        ? { background: "rgba(255,255,255,0.3)" }
                        : {}
                    }
                    onClick={() => handlePresetChange(p)}
                  >
                    {p.name}
                  </button>
                ))}
              </div>

              <PresetEditor config={customConfig} onChange={setCustomConfig} />
              <AudioSettings
                volumes={volumes}
                setVolumes={setVolumes}
                speakText={speak}
                playBeep={playBeep}
                initAudio={initAudio}
              />
            </div>
            <div
              style={{
                marginTop: "2rem",
                marginBottom: "2rem",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Button variant="primary" onClick={() => setShowSettings(false)}>
                設定完了
              </Button>
            </div>
          </div>
        )}

        {timer.status === "finished" ? (
          <div className="flex-col flex-center gap-8 animate-pulse-soft">
            <Check size={120} color="white" />
            <h2 className="text-title">おつかれさま！</h2>
            <Button variant="primary" onClick={timer.resetTimer}>
              <RotateCcw size={24} /> もういっかい！
            </Button>
          </div>
        ) : (
          <div
            className="flex-col flex-center"
            style={{ width: "100%", flex: 1 }}
          >
            <div
              className="text-subtitle"
              style={{ marginBottom: "2rem", textAlign: "center" }}
            >
              {timer.currentPhase ? (
                <>
                  {timer.currentPhase.set} セット目 / {timer.totalSets}
                  {timer.currentPhase.rep &&
                    ` — ${timer.currentPhase.rep} 回目 / ${timer.currentPhase.totalReps}`}
                  <br />
                  <span
                    style={{
                      fontSize: "2rem",
                      color: "#fff",
                      fontWeight: 700,
                      marginTop: "0.5rem",
                      display: "block",
                    }}
                  >
                    {timer.currentPhase.name}
                  </span>
                </>
              ) : (
                "準備オッケー？"
              )}
            </div>

            <h2 className="text-massive">
              {timer.status === "idle"
                ? formatTime(timer.timeLeft || 0)
                : formatTime(timer.timeLeft)}
            </h2>

            <div className="flex-center gap-4" style={{ marginTop: "4rem" }}>
              <Button
                variant="icon"
                onClick={timer.skipBackward}
                disabled={timer.status === "idle"}
              >
                <SkipBack size={32} />
              </Button>

              <Button
                variant="primary"
                style={{ padding: "1.5rem", borderRadius: "50%" }}
                onClick={handleStart}
              >
                {timer.status === "running" ? (
                  <Pause size={48} fill="white" />
                ) : (
                  <Play size={48} fill="white" style={{ marginLeft: "6px" }} />
                )}
              </Button>

              <Button
                variant="icon"
                onClick={timer.skipForward}
                disabled={timer.status === "finished"}
              >
                <SkipForward size={32} />
              </Button>
            </div>

            {timer.status === "paused" && (
              <Button
                variant="icon"
                style={{ marginTop: "2rem", opacity: 0.6 }}
                onClick={timer.resetTimer}
              >
                <RotateCcw size={24} />
                リセット
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
