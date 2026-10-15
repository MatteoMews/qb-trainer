import { SIM_DURATION_S } from "../../engine/simulate";
import { useSimulationStore, type PlaybackSpeed } from "./simulationStore";
import "./PlaybackControls.css";

const SPEEDS: PlaybackSpeed[] = [0.25, 0.5, 1];
const STEP_S = 0.1;

export function PlaybackControls() {
  const { t, isPlaying, speed, setT, stepBy, setPlaying, setSpeed, reset } = useSimulationStore();

  return (
    <div className="playback-controls">
      <div className="playback-controls__row">
        <button type="button" onClick={() => stepBy(-STEP_S)} aria-label="Schritt zurück">
          ⏮
        </button>
        <button type="button" onClick={() => setPlaying(!isPlaying)} aria-label={isPlaying ? "Pause" : "Play"}>
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button type="button" onClick={() => stepBy(STEP_S)} aria-label="Schritt vor">
          ⏭
        </button>
        <button type="button" onClick={reset} aria-label="Reset">
          ⟲
        </button>
        <span className="playback-controls__time">{t.toFixed(2)}s</span>
      </div>

      <input
        className="playback-controls__scrubber"
        type="range"
        min={0}
        max={SIM_DURATION_S}
        step={0.01}
        value={t}
        onChange={(e) => setT(Number(e.target.value))}
      />

      <div className="playback-controls__row">
        <span className="playback-controls__label">Tempo</span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            type="button"
            className={s === speed ? "playback-controls__speed playback-controls__speed--active" : "playback-controls__speed"}
            onClick={() => setSpeed(s)}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
