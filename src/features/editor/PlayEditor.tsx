import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Field2D } from "../../components/Field2D";
import { FORMATIONS, findFormation } from "../../data/formations";
import { CONCEPTS, findConcept } from "../../data/concepts";
import { HASH_FROM_SIDELINE_YD, FIELD_WIDTH_YD, type Hash } from "../../data/field";
import { ROUTE_TREE } from "../../data/routeTree";
import type { Point } from "../../data/schemas";
import { playPointToSvg, svgToPlayPoint } from "../../engine/coordinates";
import { savePlay } from "../../data/playbookRepository";
import { useEditorStore } from "./editorStore";
import { PlayerToken } from "./PlayerToken";
import { RoutePath } from "./RoutePath";
import { clientToSvgPoint } from "./svgPointer";
import "./PlayEditor.css";

const HASH_OPTIONS: { value: Hash; label: string }[] = [
  { value: "left", label: `Links (${HASH_FROM_SIDELINE_YD} yd)` },
  { value: "middle", label: `Mitte (${(FIELD_WIDTH_YD / 2).toFixed(1)} yd)` },
  { value: "right", label: `Rechts (${(FIELD_WIDTH_YD - HASH_FROM_SIDELINE_YD).toFixed(1)} yd)` },
];

export interface PlayEditorProps {
  onSaved?: () => void;
}

export function PlayEditor({ onSaved }: PlayEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const {
    playName,
    formation,
    hash,
    yardLine,
    players,
    selectedId,
    isDrawingRoute,
    setPlayName,
    loadFormation,
    setHash,
    setYardLine,
    applyConceptToField,
    selectPlayer,
    movePlayer,
    assignRoute,
    setBlock,
    clearAssignment,
    startDrawingRoute,
    addRouteWaypoint,
    finishDrawingRoute,
    mirrorAll,
    toPlay,
  } = useEditorStore();

  const selectedPlayer = players.find((p) => p.id === selectedId) ?? null;

  function handlePlayerPointerDown(id: string, event: ReactPointerEvent<SVGGElement>) {
    event.stopPropagation();
    if (isDrawingRoute) return;
    selectPlayer(id);
    setDraggingId(id);
  }

  function handleFieldPointerMove(event: ReactPointerEvent<SVGSVGElement>) {
    if (!draggingId) return;
    const svgPoint = clientToSvgPoint(svgRef, event.clientX, event.clientY);
    if (!svgPoint) return;
    movePlayer(draggingId, svgToPlayPoint(svgPoint, yardLine));
  }

  function handleFieldPointerUp() {
    setDraggingId(null);
  }

  function handleFieldClick(event: ReactPointerEvent<SVGSVGElement>) {
    if (!isDrawingRoute) return;
    const svgPoint = clientToSvgPoint(svgRef, event.clientX, event.clientY);
    if (!svgPoint) return;
    addRouteWaypoint(svgToPlayPoint(svgPoint, yardLine));
  }

  async function handleSave() {
    const play = toPlay();
    if (play.offense.players.length === 0) {
      setSaveStatus("Mindestens ein Spieler braucht eine Route oder Block-Zuweisung.");
      return;
    }
    await savePlay(play);
    setSaveStatus(`„${play.name}" gespeichert.`);
    onSaved?.();
  }

  return (
    <div className="play-editor">
      <div className="play-editor__field">
        <Field2D
          ref={svgRef}
          onPointerDown={handleFieldClick}
          onPointerMove={handleFieldPointerMove}
          onPointerUp={handleFieldPointerUp}
        >
          {players.map(
            (player) =>
              player.task.type === "route" && (
                <RoutePath
                  key={`route-${player.id}`}
                  start={player.start}
                  waypoints={player.task.points}
                  ballYardLine={yardLine}
                  selected={player.id === selectedId}
                />
              ),
          )}
          {players.map((player) => (
            <PlayerAt
              key={player.id}
              id={player.id}
              position={player.position}
              start={player.start}
              ballYardLine={yardLine}
              selected={player.id === selectedId}
              onPointerDown={(e) => handlePlayerPointerDown(player.id, e)}
            />
          ))}
        </Field2D>
      </div>

      <div className="play-editor__panel">
        <section className="play-editor__section">
          <label>
            Name
            <input value={playName} onChange={(e) => setPlayName(e.target.value)} />
          </label>
          <label>
            Formation
            <select
              value={formation.name}
              onChange={(e) => {
                const next = findFormation(e.target.value);
                if (next) loadFormation(next);
              }}
            >
              {FORMATIONS.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name} ({f.personnel})
                </option>
              ))}
            </select>
          </label>
          <p className="play-editor__hint">{formation.description}</p>
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
          <label>
            Yard-Linie
            <input type="number" min={0} max={100} value={yardLine} onChange={(e) => setYardLine(Number(e.target.value))} />
          </label>
          <button type="button" onClick={mirrorAll}>
            Formation spiegeln
          </button>
        </section>

        <section className="play-editor__section">
          <h2>Konzept laden</h2>
          <div className="play-editor__chip-list">
            {CONCEPTS.map((concept) => (
              <button
                key={concept.name}
                type="button"
                className="play-editor__chip"
                title={concept.description}
                onClick={() => {
                  const c = findConcept(concept.name);
                  if (c) applyConceptToField(c);
                }}
              >
                {concept.name}
              </button>
            ))}
          </div>
        </section>

        <section className="play-editor__section">
          <h2>Ausgewählter Spieler{selectedPlayer ? `: ${selectedPlayer.id}` : ""}</h2>
          {!selectedPlayer && <p className="play-editor__hint">Spieler auf dem Feld anklicken.</p>}
          {selectedPlayer && (
            <>
              <div className="play-editor__chip-list">
                {ROUTE_TREE.map((route) => (
                  <button
                    key={route.name}
                    type="button"
                    className="play-editor__chip"
                    title={route.description}
                    onClick={() => assignRoute(selectedPlayer.id, route.name)}
                  >
                    {route.treeNumber !== undefined ? `${route.treeNumber} · ` : ""}
                    {route.name}
                  </button>
                ))}
              </div>
              <div className="play-editor__actions">
                <button type="button" onClick={() => setBlock(selectedPlayer.id)}>
                  Blocken
                </button>
                {!isDrawingRoute ? (
                  <button type="button" onClick={() => startDrawingRoute(selectedPlayer.id)}>
                    Route frei zeichnen
                  </button>
                ) : (
                  <button type="button" onClick={finishDrawingRoute}>
                    Zeichnen beenden
                  </button>
                )}
                <button type="button" onClick={() => clearAssignment(selectedPlayer.id)}>
                  Zuweisung löschen
                </button>
              </div>
              {isDrawingRoute && <p className="play-editor__hint">Klicke ins Feld, um Wegpunkte zu setzen.</p>}
            </>
          )}
        </section>

        <section className="play-editor__section">
          <button type="button" className="play-editor__save" onClick={handleSave}>
            Spielzug speichern
          </button>
          {saveStatus && <p className="play-editor__hint">{saveStatus}</p>}
        </section>
      </div>
    </div>
  );
}

interface PlayerAtProps {
  id: string;
  position: Parameters<typeof PlayerToken>[0]["position"];
  start: Point;
  ballYardLine: number;
  selected: boolean;
  onPointerDown: (event: ReactPointerEvent<SVGGElement>) => void;
}

function PlayerAt({ id, position, start, ballYardLine, selected, onPointerDown }: PlayerAtProps) {
  const svgPoint = playPointToSvg(start, ballYardLine);
  return <PlayerToken id={id} position={position} x={svgPoint.x} y={svgPoint.y} selected={selected} onPointerDown={onPointerDown} />;
}
