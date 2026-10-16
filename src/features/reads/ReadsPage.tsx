import { useEffect, useMemo, useState } from "react";
import { CONCEPTS, findConcept } from "../../data/concepts";
import { FORMATIONS, findFormation } from "../../data/formations";
import { findCoverage } from "../../data/coverages";
import { findFront } from "../../data/fronts";
import type { Hash } from "../../data/field";
import { HASH_FROM_SIDELINE_YD, FIELD_WIDTH_YD } from "../../data/field";
import type { SavedDefense, SavedPlay } from "../../data/db";
import { listDefenses } from "../../data/defenseRepository";
import { listPlays, updateReadNotes } from "../../data/playbookRepository";
import { getKeyDefender, setKeyDefender } from "../../data/readAnnotationRepository";
import { generateReadExplanation } from "../../engine/readRules";
import { ReadsField } from "./ReadsField";
import { ReadsExplanation } from "./ReadsExplanation";
import { MyPlayReadsField } from "./MyPlayReadsField";
import "./ReadsPage.css";

const HASH_OPTIONS: { value: Hash; label: string }[] = [
  { value: "left", label: `Links (${HASH_FROM_SIDELINE_YD} yd)` },
  { value: "middle", label: `Mitte (${(FIELD_WIDTH_YD / 2).toFixed(1)} yd)` },
  { value: "right", label: `Rechts (${(FIELD_WIDTH_YD - HASH_FROM_SIDELINE_YD).toFixed(1)} yd)` },
];

type ReadsMode = "library" | "my-plays";

export function ReadsPage() {
  const [mode, setMode] = useState<ReadsMode>("library");

  const [conceptName, setConceptName] = useState(CONCEPTS[0].name);
  const [formationName, setFormationName] = useState(FORMATIONS[0].name);
  const [hash, setHash] = useState<Hash>("middle");
  const [defenses, setDefenses] = useState<SavedDefense[]>([]);
  const [defenseId, setDefenseId] = useState<number | "">("");

  const [plays, setPlays] = useState<SavedPlay[]>([]);
  const [playId, setPlayId] = useState<number | "">("");
  const [myDefenseId, setMyDefenseId] = useState<number | "">("");
  const [keyDefenderId, setKeyDefenderId] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    listDefenses().then((data) => {
      if (!cancelled) setDefenses(data);
    });
    listPlays().then((data) => {
      if (!cancelled) setPlays(data);
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

  const selectedPlay = plays.find((p) => p.id === playId);
  const selectedMyDefense = defenses.find((d) => d.id === myDefenseId);

  useEffect(() => {
    let cancelled = false;
    const lookup = playId && myDefenseId ? getKeyDefender(playId, myDefenseId) : Promise.resolve(undefined);
    lookup.then((id) => {
      if (!cancelled) setKeyDefenderId(id);
    });
    return () => {
      cancelled = true;
    };
  }, [playId, myDefenseId]);

  async function handleDefenderClick(defenderId: string) {
    if (!playId || !myDefenseId) return;
    const next = keyDefenderId === defenderId ? null : defenderId;
    setKeyDefenderId(next ?? undefined);
    await setKeyDefender(playId, myDefenseId, next);
  }

  async function handleNotesSaved(id: number, notes: string) {
    setPlays((prev) => prev.map((p) => (p.id === id ? { ...p, data: { ...p.data, qbReadNotes: notes } } : p)));
  }

  return (
    <div className="reads-page">
      <div className="reads-page__field">
        <div className="reads-page__mode-tabs">
          <button
            type="button"
            className={mode === "library" ? "reads-page__mode-tab reads-page__mode-tab--active" : "reads-page__mode-tab"}
            onClick={() => setMode("library")}
          >
            Konzept-Bibliothek
          </button>
          <button
            type="button"
            className={mode === "my-plays" ? "reads-page__mode-tab reads-page__mode-tab--active" : "reads-page__mode-tab"}
            onClick={() => setMode("my-plays")}
          >
            Meine Spielzüge
          </button>
        </div>

        {mode === "library" ? (
          <ReadsField
            concept={concept}
            formation={formation}
            hash={hash}
            front={front}
            coverage={coverage}
            highlightDefenderId={explanation?.keyDefender.id}
          />
        ) : selectedPlay ? (
          <MyPlayReadsField
            play={selectedPlay.data}
            defense={selectedMyDefense?.data}
            keyDefenderId={keyDefenderId}
            onDefenderClick={handleDefenderClick}
          />
        ) : (
          <p className="reads-page__hint">Wähle einen deiner gespeicherten Spielzüge.</p>
        )}
      </div>

      <div className="reads-page__panel">
        {mode === "library" ? (
          <>
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
          </>
        ) : (
          <>
            <section className="reads-page__section">
              <label>
                Spielzug
                <select value={playId} onChange={(e) => setPlayId(e.target.value ? Number(e.target.value) : "")}>
                  <option value="">— auswählen —</option>
                  {plays.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.data.name}
                    </option>
                  ))}
                </select>
              </label>
              {plays.length === 0 && <p className="reads-page__hint">Noch keine Spielzüge im Playbook gespeichert.</p>}

              <label>
                Defense (optional, für Schlüssel-Verteidiger-Markierung)
                <select value={myDefenseId} onChange={(e) => setMyDefenseId(e.target.value ? Number(e.target.value) : "")}>
                  <option value="">— auswählen —</option>
                  {defenses.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.data.name}
                    </option>
                  ))}
                </select>
              </label>
              {myDefenseId && (
                <p className="reads-page__hint">Klicke einen Verteidiger im Feld an, um ihn als Schlüssel-Read für diese Kombination zu markieren.</p>
              )}
            </section>

            {selectedPlay?.id !== undefined ? (
              <ReadNotesEditor
                key={selectedPlay.id}
                playId={selectedPlay.id}
                initialNotes={selectedPlay.data.qbReadNotes ?? ""}
                onSaved={handleNotesSaved}
              />
            ) : (
              <p className="reads-page__hint">Wähle einen Spielzug, um seine Read-Erklärung zu sehen oder zu bearbeiten.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface ReadNotesEditorProps {
  playId: number;
  initialNotes: string;
  onSaved: (playId: number, notes: string) => void;
}

/** Eigene Komponente statt Effekt-Reset: der Elternteil vergibt `key={playId}`, damit diese
 *  Komponente bei Play-Wechsel sauber neu montiert wird und ihren lokalen Entwurf direkt aus den
 *  Props initialisiert (kein `useEffect`, das beim Mount synchron setState aufrufen müsste). */
function ReadNotesEditor({ playId, initialNotes, onSaved }: ReadNotesEditorProps) {
  const [draft, setDraft] = useState(initialNotes);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    await updateReadNotes(playId, draft);
    onSaved(playId, draft);
    setSaved(true);
  }

  return (
    <section className="reads-page__section">
      <h2>QB-Read-Erklärung</h2>
      <p className="reads-page__hint">Frei editierbar - deine Notizen zu Progression, Schlüssel-Verteidiger und worauf du achten musst.</p>
      <textarea
        className="reads-page__notes"
        rows={10}
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setSaved(false);
        }}
        placeholder="z.B. Progression 1-2-3, worauf der Flat-Defender achtet, wann du den Hot-Route nutzt..."
      />
      <button type="button" className="reads-page__save" onClick={handleSave}>
        Speichern
      </button>
      {saved && <span className="reads-page__saved-hint">Gespeichert.</span>}
    </section>
  );
}
