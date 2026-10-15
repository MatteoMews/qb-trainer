import { useEffect, useRef, useState } from "react";
import type { SavedDefense, SavedPlay } from "../../data/db";
import { listDefenses } from "../../data/defenseRepository";
import { listPlays } from "../../data/playbookRepository";
import { SIM_DURATION_S } from "../../engine/simulate";
import { PlaybackControls } from "./PlaybackControls";
import { SimulationField } from "./SimulationField";
import { useSimulationStore } from "./simulationStore";
import "./SimulationPage.css";

export function SimulationPage() {
  const [plays, setPlays] = useState<SavedPlay[]>([]);
  const [defenses, setDefenses] = useState<SavedDefense[]>([]);

  const {
    play,
    defense,
    isPlaying,
    speed,
    showZones,
    showOpenIndicator,
    showLeverage,
    selectPlay,
    selectDefense,
    setT,
    setPlaying,
    toggleShowZones,
    toggleShowOpenIndicator,
    toggleShowLeverage,
  } = useSimulationStore();

  useEffect(() => {
    let cancelled = false;
    Promise.all([listPlays(), listDefenses()]).then(([p, d]) => {
      if (!cancelled) {
        setPlays(p);
        setDefenses(d);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const lastFrameTime = useRef<number | null>(null);
  useEffect(() => {
    if (!isPlaying) {
      lastFrameTime.current = null;
      return;
    }
    let raf: number;
    const tick = (now: number) => {
      if (lastFrameTime.current !== null) {
        const deltaS = ((now - lastFrameTime.current) / 1000) * speed;
        const state = useSimulationStore.getState();
        const nextT = state.t + deltaS;
        if (nextT >= SIM_DURATION_S) {
          setT(SIM_DURATION_S);
          setPlaying(false);
        } else {
          setT(nextT);
        }
      }
      lastFrameTime.current = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, speed, setT, setPlaying]);

  return (
    <div className="simulation-page">
      <div className="simulation-page__field">
        <SimulationField />
        <PlaybackControls />
      </div>

      <div className="simulation-page__panel">
        <section className="simulation-page__section">
          <label>
            Spielzug
            <select
              value={play?.id ?? ""}
              onChange={(e) => selectPlay(plays.find((p) => p.id === Number(e.target.value)) ?? null)}
            >
              <option value="">— auswählen —</option>
              {plays.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.data.name}
                </option>
              ))}
            </select>
          </label>
          {plays.length === 0 && <p className="simulation-page__hint">Noch keine Spielzüge im Playbook gespeichert.</p>}

          <label>
            Defense
            <select
              value={defense?.id ?? ""}
              onChange={(e) => selectDefense(defenses.find((d) => d.id === Number(e.target.value)) ?? null)}
            >
              <option value="">— auswählen —</option>
              {defenses.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.data.name}
                </option>
              ))}
            </select>
          </label>
          {defenses.length === 0 && <p className="simulation-page__hint">Noch keine Defenses gespeichert.</p>}
        </section>

        <section className="simulation-page__section">
          <h2>Visuelle Hilfen</h2>
          <label className="simulation-page__checkbox">
            <input type="checkbox" checked={showZones} onChange={toggleShowZones} />
            Zonen als Flächen
          </label>
          <label className="simulation-page__checkbox">
            <input type="checkbox" checked={showOpenIndicator} onChange={toggleShowOpenIndicator} />
            Offen/Eng-Anzeige pro Receiver
          </label>
          <label className="simulation-page__checkbox">
            <input type="checkbox" checked={showLeverage} onChange={toggleShowLeverage} />
            Leverage-Linien (Man-Coverage)
          </label>
        </section>
      </div>
    </div>
  );
}
