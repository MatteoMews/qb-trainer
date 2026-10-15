import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { SavedDefense, SavedPlay } from "../../data/db";
import { listDefenses } from "../../data/defenseRepository";
import { listPlays } from "../../data/playbookRepository";
import { SIM_DURATION_S } from "../../engine/simulate";
import { PlaybackControls } from "./PlaybackControls";
import { SimulationField } from "./SimulationField";
import { useSimulationStore, type CameraMode, type ViewMode } from "./simulationStore";
import "./SimulationPage.css";

// Three.js/R3F ist groß (~1 MB) - nur laden, wenn die 3D-Ansicht tatsächlich gebraucht wird.
const Simulation3D = lazy(() => import("./Simulation3D").then((m) => ({ default: m.Simulation3D })));

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: "2d", label: "2D" },
  { value: "3d", label: "3D" },
  { value: "split", label: "Split" },
];

const CAMERA_MODES: { value: CameraMode; label: string }[] = [
  { value: "qb", label: "QB-Augenhöhe" },
  { value: "free", label: "Frei" },
  { value: "endzone", label: "Endzone" },
];

export function SimulationPage() {
  const [plays, setPlays] = useState<SavedPlay[]>([]);
  const [defenses, setDefenses] = useState<SavedDefense[]>([]);

  // Selektiv abonniert (ohne `t`), damit diese Seite nicht bei jedem Animationsframe
  // neu rendert, während die Simulation läuft - `t` wird nur von PlaybackControls/
  // SimulationField/Simulation3D direkt gebraucht.
  const {
    play,
    defense,
    isPlaying,
    speed,
    showZones,
    showOpenIndicator,
    showLeverage,
    viewMode,
    cameraMode,
    selectPlay,
    selectDefense,
    setT,
    stepBy,
    setPlaying,
    reset,
    toggleShowZones,
    toggleShowOpenIndicator,
    toggleShowLeverage,
    setViewMode,
    setCameraMode,
  } = useSimulationStore(
    useShallow((s) => ({
      play: s.play,
      defense: s.defense,
      isPlaying: s.isPlaying,
      speed: s.speed,
      showZones: s.showZones,
      showOpenIndicator: s.showOpenIndicator,
      showLeverage: s.showLeverage,
      viewMode: s.viewMode,
      cameraMode: s.cameraMode,
      selectPlay: s.selectPlay,
      selectDefense: s.selectDefense,
      setT: s.setT,
      stepBy: s.stepBy,
      setPlaying: s.setPlaying,
      reset: s.reset,
      toggleShowZones: s.toggleShowZones,
      toggleShowOpenIndicator: s.toggleShowOpenIndicator,
      toggleShowLeverage: s.toggleShowLeverage,
      setViewMode: s.setViewMode,
      setCameraMode: s.setCameraMode,
    })),
  );

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

  // Tastenkürzel laut Projektauftrag Abschnitt 6: Leertaste = Play/Pause, Pfeile = Schritt, R = Reset.
  // Greift nicht, solange der Fokus in einem Eingabefeld liegt (z. B. Spielzug-/Defense-Auswahl).
  useEffect(() => {
    const STEP_S = 0.1;
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) {
        return;
      }
      switch (e.key) {
        case " ":
        case "Spacebar":
          e.preventDefault();
          setPlaying(!useSimulationStore.getState().isPlaying);
          break;
        case "ArrowLeft":
          e.preventDefault();
          stepBy(-STEP_S);
          break;
        case "ArrowRight":
          e.preventDefault();
          stepBy(STEP_S);
          break;
        case "r":
        case "R":
          e.preventDefault();
          reset();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setPlaying, stepBy, reset]);

  return (
    <div className={viewMode === "split" ? "simulation-page simulation-page--split" : "simulation-page"}>
      <div className="simulation-page__field">
        <div className="simulation-page__view-tabs">
          {VIEW_MODES.map((v) => (
            <button
              key={v.value}
              type="button"
              className={v.value === viewMode ? "simulation-page__view-tab simulation-page__view-tab--active" : "simulation-page__view-tab"}
              onClick={() => setViewMode(v.value)}
            >
              {v.label}
            </button>
          ))}
        </div>

        {viewMode === "2d" && <SimulationField />}
        {viewMode === "3d" && (
          <Suspense fallback={<div className="simulation-page__loading-3d">3D-Ansicht wird geladen…</div>}>
            <Simulation3D />
          </Suspense>
        )}
        {viewMode === "split" && (
          <div className="simulation-page__split">
            <SimulationField />
            <Suspense fallback={<div className="simulation-page__loading-3d">3D-Ansicht wird geladen…</div>}>
              <Simulation3D />
            </Suspense>
          </div>
        )}

        {(viewMode === "3d" || viewMode === "split") && (
          <div className="simulation-page__camera-tabs">
            <span className="simulation-page__label">Kamera</span>
            {CAMERA_MODES.map((c) => (
              <button
                key={c.value}
                type="button"
                className={
                  c.value === cameraMode ? "simulation-page__view-tab simulation-page__view-tab--active" : "simulation-page__view-tab"
                }
                onClick={() => setCameraMode(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

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
