import { useEffect, useMemo, useState } from "react";
import { CONCEPTS, findConcept } from "../../data/concepts";
import { FORMATIONS, findFormation } from "../../data/formations";
import { findCoverage } from "../../data/coverages";
import { findFront } from "../../data/fronts";
import type { Hash } from "../../data/field";
import { HASH_FROM_SIDELINE_YD, FIELD_WIDTH_YD } from "../../data/field";
import type { SavedDefense } from "../../data/db";
import { listDefenses } from "../../data/defenseRepository";
import { generateReadExplanation } from "../../engine/readRules";
import { ReadsField } from "./ReadsField";
import { ReadsExplanation } from "./ReadsExplanation";
import "./ReadsPage.css";

const HASH_OPTIONS: { value: Hash; label: string }[] = [
  { value: "left", label: `Links (${HASH_FROM_SIDELINE_YD} yd)` },
  { value: "middle", label: `Mitte (${(FIELD_WIDTH_YD / 2).toFixed(1)} yd)` },
  { value: "right", label: `Rechts (${(FIELD_WIDTH_YD - HASH_FROM_SIDELINE_YD).toFixed(1)} yd)` },
];

export function ReadsPage() {
  const [conceptName, setConceptName] = useState(CONCEPTS[0].name);
  const [formationName, setFormationName] = useState(FORMATIONS[0].name);
  const [hash, setHash] = useState<Hash>("middle");
  const [defenses, setDefenses] = useState<SavedDefense[]>([]);
  const [defenseId, setDefenseId] = useState<number | "">("");

  useEffect(() => {
    let cancelled = false;
    listDefenses().then((data) => {
      if (!cancelled) setDefenses(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const concept = findConcept(conceptName)!;
  const formation = findFormation(formationName)!;
  const savedDefense = defenses.find((d) => d.id === defenseId);
  const front = savedDefense ? findFront(savedDefense.data.front) : undefined;
  const coverage = savedDefense ? findCoverage(savedDefense.data.coverage) : undefined;

  const explanation = useMemo(() => {
    if (!coverage) return null;
    return generateReadExplanation(concept, coverage, formation, hash, front, savedDefense?.data.pressure);
  }, [concept, coverage, formation, hash, front, savedDefense]);

  return (
    <div className="reads-page">
      <div className="reads-page__field">
        <ReadsField
          concept={concept}
          formation={formation}
          hash={hash}
          front={front}
          coverage={coverage}
          highlightDefenderId={explanation?.keyDefender.id}
        />
      </div>

      <div className="reads-page__panel">
        <section className="reads-page__section">
          <label>
            Konzept
            <select value={conceptName} onChange={(e) => setConceptName(e.target.value)}>
              {CONCEPTS.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <p className="reads-page__hint">{concept.description}</p>

          <label>
            Formation
            <select value={formationName} onChange={(e) => setFormationName(e.target.value)}>
              {FORMATIONS.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.name}
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

          <label>
            Defense
            <select value={defenseId} onChange={(e) => setDefenseId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">— auswählen —</option>
              {defenses.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.data.name}
                </option>
              ))}
            </select>
          </label>
          {defenses.length === 0 && <p className="reads-page__hint">Noch keine Defenses gespeichert (siehe Tab „Defenses").</p>}
        </section>

        {explanation && coverage ? (
          <ReadsExplanation concept={concept} coverage={coverage} explanation={explanation} />
        ) : (
          <p className="reads-page__hint">Wähle eine Defense, um die Read-Erklärung zu sehen.</p>
        )}
      </div>
    </div>
  );
}
