import { COVERAGES } from "../../data/coverages";
import type { QuizQuestionType } from "../../data/db";
import { ALL_QUESTION_TYPES, useQuizStore, type TimePressure } from "./quizStore";
import { QuizStats } from "./QuizStats";
import "./QuizSetup.css";

const QUESTION_TYPE_LABELS: Record<QuizQuestionType, string> = {
  "pre-snap": "Pre-Snap-Erkennung",
  "post-snap-receiver": "Post-Snap: Receiver anklicken (3D)",
  "progression-order": "Progression-Reihenfolge",
  beater: "Beater-Frage",
  disguise: "Disguise-Erkennung",
};

const TIME_PRESSURE_OPTIONS: TimePressure[] = ["off", 6, 10, 15];

export function QuizSetup() {
  const { setup, updateSetup, startQuiz } = useQuizStore();

  function toggleType(type: QuizQuestionType) {
    const next = setup.questionTypes.includes(type)
      ? setup.questionTypes.filter((t) => t !== type)
      : [...setup.questionTypes, type];
    updateSetup({ questionTypes: next });
  }

  function toggleCoverage(name: string) {
    const next = setup.coverageNames.includes(name) ? setup.coverageNames.filter((n) => n !== name) : [...setup.coverageNames, name];
    updateSetup({ coverageNames: next });
  }

  const canStart = setup.questionTypes.length > 0;

  return (
    <div className="quiz-setup">
      <section className="quiz-setup__section">
        <h2>Fragetypen</h2>
        {ALL_QUESTION_TYPES.map((type) => (
          <label key={type} className="quiz-setup__checkbox">
            <input type="checkbox" checked={setup.questionTypes.includes(type)} onChange={() => toggleType(type)} />
            {QUESTION_TYPE_LABELS[type]}
          </label>
        ))}
      </section>

      <section className="quiz-setup__section">
        <h2>Zeitdruck</h2>
        <div className="quiz-setup__chip-list">
          {TIME_PRESSURE_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              className={option === setup.timePressure ? "quiz-setup__chip quiz-setup__chip--active" : "quiz-setup__chip"}
              onClick={() => updateSetup({ timePressure: option })}
            >
              {option === "off" ? "Aus" : `${option}s`}
            </button>
          ))}
        </div>
      </section>

      <section className="quiz-setup__section">
        <h2>Anzahl Fragen</h2>
        <input
          type="number"
          min={5}
          max={30}
          value={setup.questionCount}
          onChange={(e) => updateSetup({ questionCount: Math.min(30, Math.max(5, Number(e.target.value))) })}
        />
      </section>

      <section className="quiz-setup__section">
        <label className="quiz-setup__checkbox">
          <input type="checkbox" checked={setup.onlyMyPlays} onChange={(e) => updateSetup({ onlyMyPlays: e.target.checked })} />
          Nur meine gespeicherten Spielzüge (Konzepte aus dem Playbook)
        </label>
      </section>

      <section className="quiz-setup__section">
        <h2>Coverages filtern (leer = alle)</h2>
        <div className="quiz-setup__chip-list">
          {COVERAGES.map((coverage) => (
            <button
              key={coverage.name}
              type="button"
              className={setup.coverageNames.includes(coverage.name) ? "quiz-setup__chip quiz-setup__chip--active" : "quiz-setup__chip"}
              onClick={() => toggleCoverage(coverage.name)}
            >
              {coverage.name}
            </button>
          ))}
        </div>
      </section>

      <button type="button" className="quiz-setup__start" disabled={!canStart} onClick={() => startQuiz()}>
        Quiz starten
      </button>
      {!canStart && <p className="quiz-setup__hint">Wähle mindestens einen Fragetyp.</p>}

      <section className="quiz-setup__section">
        <h2>Statistik</h2>
        <QuizStats />
      </section>
    </div>
  );
}
