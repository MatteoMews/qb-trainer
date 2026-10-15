import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Field2D } from "../../components/Field2D";
import { FRONTS, findFront } from "../../data/fronts";
import { COVERAGES, findCoverage } from "../../data/coverages";
import { PRESSURES } from "../../data/pressures";
import { HASH_FROM_SIDELINE_YD, FIELD_WIDTH_YD, type Hash } from "../../data/field";
import { playPointToSvg, svgToPlayPoint } from "../../engine/coordinates";
import { saveDefense } from "../../data/defenseRepository";
import { useDefenseStore, type DefensePlayerState } from "./defenseStore";
import { DefenderToken } from "./DefenderToken";
import { clientToSvgPoint } from "../editor/svgPointer";
import "./DefenseEditor.css";

const HASH_OPTIONS: { value: Hash; label: string }[] = [
  { value: "left", label: `Links (${HASH_FROM_SIDELINE_YD} yd)` },
  { value: "middle", label: `Mitte (${(FIELD_WIDTH_YD / 2).toFixed(1)} yd)` },
  { value: "right", label: `Rechts (${(FIELD_WIDTH_YD - HASH_FROM_SIDELINE_YD).toFixed(1)} yd)` },
];

/** Feste Anzeige-Yard-Linie: Defenses werden unabhängig von einer konkreten Feldposition
 *  definiert (wie in der Praxis), nur zum Rendern brauchen wir einen Bezugspunkt. */
const DISPLAY_YARD_LINE = 50;

export interface DefenseEditorProps {
  onSaved?: () => void;
}

export function DefenseEditor({ onSaved }: DefenseEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const {
    defenseName,
    front,
    coverage,
    pressure,
    disguisedAsCoverage,
    hash,
    players,
    selectedId,
    showingPreSnapDisguise,
    setDefenseName,
    loadFront,
    loadCoverage,
    setPressure,
    setDisguise,
    setHash,
    selectPlayer,
    movePlayer,
    toggleDisguiseView,
    toDefense,
  } = useDefenseStore();

  const activeCoverage = showingPreSnapDisguise && disguisedAsCoverage ? disguisedAsCoverage : coverage;
  const selectedPlayer = players.find((p) => p.id === selectedId) ?? null;

  function handlePlayerPointerDown(id: string, event: ReactPointerEvent<SVGGElement>) {
    event.stopPropagation();
    selectPlayer(id);
    setDraggingId(id);
  }

  function handleFieldPointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (!draggingId) return;
    const svgPoint = clientToSvgPoint(svgRef, event.clientX, event.clientY);
    if (!svgPoint) return;
    movePlayer(draggingId, svgToPlayPoint(svgPoint, DISPLAY_YARD_LINE));
  }

  function handleFieldPointerUp() {
    setDraggingId(null);
  }

  async function handleSave() {
    const defense = toDefense();
    await saveDefense(defense);
    setSaveStatus(`„${defense.name}" gespeichert.`);
    onSaved?.();
  }

  return (
    <div className="defense-editor">
      <div className="defense-editor__field">
        <Field2D ref={svgRef} onPointerMove={handleFieldPointerMove} onPointerUp={handleFieldPointerUp}>
          {players.map((player) => (
            <DefenderAt
              key={player.id}
              player={player}
              selected={player.id === selectedId}
              onPointerDown={(e) => handlePlayerPointerDown(player.id, e)}
            />
          ))}
        </Field2D>
        {disguisedAsCoverage && (
          <button type="button" className="defense-editor__disguise-toggle" onClick={toggleDisguiseView}>
            {showingPreSnapDisguise ? "Zeigt: Pre-Snap-Disguise → Post-Snap anzeigen" : "Zeigt: Tatsächliche Coverage → Pre-Snap-Look anzeigen"}
          </button>
        )}
      </div>

      <div className="defense-editor__panel">
        <section className="defense-editor__section">
          <label>
            Name
            <input value={defenseName} onChange={(e) => setDefenseName(e.target.value)} />
          </label>
          <label>
            Front
            <select
              value={front.name}
              onChange={(e) => {
                const next = findFront(e.target.value);
                if (next) loadFront(next);
              }}
            >
              {FRONTS.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name} ({f.personnel})
                </option>
              ))}
            </select>
          </label>
          <p className="defense-editor__hint">{front.description}</p>
          <label>
            Coverage
            <select
              value={coverage.name}
              onChange={(e) => {
                const next = findCoverage(e.target.value);
                if (next) loadCoverage(next);
              }}
            >
              {COVERAGES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Pressure
            <select value={pressure ?? ""} onChange={(e) => setPressure(e.target.value || undefined)}>
              <option value="">Keine</option>
              {PRESSURES.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Disguise (Pre-Snap-Look)
            <select
              value={disguisedAsCoverage?.name ?? ""}
              onChange={(e) => setDisguise(e.target.value ? findCoverage(e.target.value) : undefined)}
            >
              <option value="">Keine (zeigt echte Coverage)</option>
              {COVERAGES.filter((c) => c.name !== coverage.name).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Hash
            <select value={hash} onChange={(e) => setHash(e.target.value as Hash)}>
              {HASH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </section>

        <section className="defense-editor__section">
          <h2>{activeCoverage.name}</h2>
          <p className="defense-editor__hint">{activeCoverage.description}</p>
          {activeCoverage.zones.length > 0 && (
            <ul className="defense-editor__list">
              {activeCoverage.zones.map((zone) => (
                <li key={zone.role}>
                  <strong>{zone.role}:</strong> {zone.label} — {zone.landmark}
                </li>
              ))}
            </ul>
          )}
          <div className="defense-editor__columns">
            <div>
              <h3>Stärken</h3>
              <ul className="defense-editor__list">
                {activeCoverage.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Schwächen</h3>
              <ul className="defense-editor__list">
                {activeCoverage.weaknesses.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          </div>
          <h3>Beater-Konzepte</h3>
          <div className="defense-editor__chip-list">
            {activeCoverage.beaterConcepts.map((name) => (
              <span key={name} className="defense-editor__chip">
                {name}
              </span>
            ))}
          </div>
        </section>

        {pressure && (
          <section className="defense-editor__section">
            <h2>{pressure}</h2>
            <p className="defense-editor__hint">{PRESSURES.find((p) => p.name === pressure)?.description}</p>
          </section>
        )}

        <section className="defense-editor__section">
          <h2>Ausgewählter Defender{selectedPlayer ? `: ${selectedPlayer.id}` : ""}</h2>
          {!selectedPlayer && <p className="defense-editor__hint">Spieler auf dem Feld anklicken und ziehen, um ihn zu verschieben.</p>}
          {selectedPlayer && (
            <p className="defense-editor__hint">
              {selectedPlayer.position} · {selectedPlayer.group === "box" ? "Front (DL/LB)" : "Secondary (DB)"}
            </p>
          )}
        </section>

        <section className="defense-editor__section">
          <button type="button" className="defense-editor__save" onClick={handleSave}>
            Defense speichern
          </button>
          {saveStatus && <p className="defense-editor__hint">{saveStatus}</p>}
        </section>
      </div>
    </div>
  );
}

function DefenderAt({
  player,
  selected,
  onPointerDown,
}: {
  player: DefensePlayerState;
  selected: boolean;
  onPointerDown: (event: ReactPointerEvent<SVGGElement>) => void;
}) {
  const svgPoint = playPointToSvg(player.start, DISPLAY_YARD_LINE);
  return (
    <DefenderToken
      id={player.id}
      position={player.position}
      x={svgPoint.x}
      y={svgPoint.y}
      selected={selected}
      onPointerDown={onPointerDown}
    />
  );
}
