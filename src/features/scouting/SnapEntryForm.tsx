import { useRef, useState } from "react";
import { COVERAGES } from "../../data/coverages";
import { FRONTS } from "../../data/fronts";
import type { Hash } from "../../data/field";
import { addSnap } from "../../data/scoutingRepository";
import "./SnapEntryForm.css";

const HASH_OPTIONS: { value: Hash; label: string }[] = [
  { value: "left", label: "Links" },
  { value: "middle", label: "Mitte" },
  { value: "right", label: "Rechts" },
];

const UNKNOWN = "Unbekannt";

export interface SnapEntryFormProps {
  opponentId: number;
  onSaved: () => void;
}

/** Tastaturfreundliche Schnell-Erfassung für Snaps aus dem Video (Projektauftrag 5.7): Down/
 *  Distance/Feldposition sind nach dem Speichern wieder leer (ändern sich fast jeden Snap),
 *  Front/Coverage/Hash bleiben stehen (oft über mehrere Snaps gleich) - Enter speichert direkt. */
export function SnapEntryForm({ opponentId, onSaved }: SnapEntryFormProps) {
  const [down, setDown] = useState<1 | 2 | 3 | 4>(1);
  const [distance, setDistance] = useState(10);
  const [fieldPosition, setFieldPosition] = useState(50);
  const [hash, setHash] = useState<Hash>("middle");
  const [defenseFront, setDefenseFront] = useState(UNKNOWN);
  const [coverage, setCoverage] = useState(UNKNOWN);
  const [blitz, setBlitz] = useState(false);
  const [blitzType, setBlitzType] = useState("");
  const [result, setResult] = useState("");
  const downInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await addSnap({
      opponentId,
      down,
      distance,
      fieldPosition,
      hash,
      defenseFront,
      coverage,
      blitz,
      blitzType: blitz ? blitzType.trim() || undefined : undefined,
      result: result.trim() || "—",
    });
    setDown(1);
    setDistance(10);
    setFieldPosition(50);
    setBlitz(false);
    setBlitzType("");
    setResult("");
    onSaved();
    downInputRef.current?.focus();
    downInputRef.current?.select();
  }

  return (
    <form className="snap-entry" onSubmit={handleSubmit}>
      <div className="snap-entry__row">
        <label>
          Down
          <input ref={downInputRef} type="number" min={1} max={4} value={down} onChange={(e) => setDown(Number(e.target.value) as 1 | 2 | 3 | 4)} />
        </label>
        <label>
          Distance
          <input type="number" min={0} value={distance} onChange={(e) => setDistance(Number(e.target.value))} />
        </label>
        <label>
          Feldposition (0-100)
          <input type="number" min={0} max={100} value={fieldPosition} onChange={(e) => setFieldPosition(Number(e.target.value))} />
        </label>
      </div>

      <div className="snap-entry__row">
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
          Defense Front
          <select value={defenseFront} onChange={(e) => setDefenseFront(e.target.value)}>
            <option value={UNKNOWN}>{UNKNOWN}</option>
            {FRONTS.map((f) => (
              <option key={f.name} value={f.name}>
                {f.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Coverage
          <select value={coverage} onChange={(e) => setCoverage(e.target.value)}>
            <option value={UNKNOWN}>{UNKNOWN}</option>
            {COVERAGES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="snap-entry__row">
        <label className="snap-entry__checkbox">
          <input type="checkbox" checked={blitz} onChange={(e) => setBlitz(e.target.checked)} />
          Blitz
        </label>
        {blitz && (
          <label>
            Blitz-Typ
            <input value={blitzType} onChange={(e) => setBlitzType(e.target.value)} placeholder="z.B. A-Gap" />
          </label>
        )}
        <label className="snap-entry__result">
          Ergebnis
          <input value={result} onChange={(e) => setResult(e.target.value)} placeholder="z.B. 7 yd Gain, Incomplete, INT" />
        </label>
      </div>

      <button type="submit">Snap speichern (Enter)</button>
    </form>
  );
}
