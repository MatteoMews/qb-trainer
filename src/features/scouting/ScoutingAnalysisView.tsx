import { useEffect, useState } from "react";
import type { Opponent, Snap } from "../../data/db";
import { listSnaps } from "../../data/scoutingRepository";
import {
  SITUATION_LABELS,
  analyzeBySituation,
  blitzRate,
  coverageDistribution,
  hashDistribution,
  suggestBeaters,
  type DistributionEntry,
} from "../../engine/scoutingAnalysis";
import { useNavStore } from "../../app/navStore";
import { useQuizStore } from "../quiz/quizStore";
import "./ScoutingAnalysisView.css";

function Bar({ entry }: { entry: DistributionEntry }) {
  return (
    <div className="scouting-analysis__bar-row">
      <span className="scouting-analysis__bar-label">{entry.key}</span>
      <div className="scouting-analysis__bar-track">
        <div className="scouting-analysis__bar-fill" style={{ width: `${entry.pct * 100}%` }} />
      </div>
      <span className="scouting-analysis__bar-pct">
        {Math.round(entry.pct * 100)}% ({entry.count})
      </span>
    </div>
  );
}

export interface ScoutingAnalysisViewProps {
  opponent: Opponent;
  refreshToken: number;
}

export function ScoutingAnalysisView({ opponent, refreshToken }: ScoutingAnalysisViewProps) {
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const setActiveTab = useNavStore((s) => s.setActiveTab);
  const startOpponentQuiz = useQuizStore((s) => s.startOpponentQuiz);

  useEffect(() => {
    let cancelled = false;
    listSnaps(opponent.id!).then((data) => {
      if (!cancelled) setSnaps(data);
    });
    return () => {
      cancelled = true;
    };
  }, [opponent.id, refreshToken]);

  if (snaps.length === 0) {
    return <p className="scouting-analysis__empty">Noch keine Snaps erfasst – trage zuerst welche ein.</p>;
  }

  const overallCoverage = coverageDistribution(snaps);
  const hashDist = hashDistribution(snaps);
  const situations = analyzeBySituation(snaps).filter((r) => r.situation !== "all" && r.snapCount > 0);
  const suggestions = suggestBeaters(snaps);

  async function handleTrainAgainstOpponent() {
    const weights = new Map(overallCoverage.map((entry) => [entry.key, entry.pct]));
    await startOpponentQuiz({ opponentName: opponent.name, coverageWeights: weights });
    setActiveTab("quiz");
  }

  return (
    <div className="scouting-analysis">
      <section className="scouting-analysis__section">
        <h2>Coverage-Verteilung gesamt ({snaps.length} Snaps)</h2>
        {overallCoverage.map((entry) => (
          <Bar key={entry.key} entry={entry} />
        ))}
        <p className="scouting-analysis__blitz">Blitz-Rate gesamt: {Math.round(blitzRate(snaps) * 100)}%</p>
      </section>

      <section className="scouting-analysis__section">
        <h2>Nach Hash (Field/Boundary-Tendenz)</h2>
        {hashDist.map((entry) => (
          <Bar key={entry.key} entry={entry} />
        ))}
      </section>

      <section className="scouting-analysis__section">
        <h2>Nach Situation</h2>
        {situations.map((report) => (
          <div key={report.situation} className="scouting-analysis__situation">
            <h3>
              {SITUATION_LABELS[report.situation]} ({report.snapCount} Snaps, {Math.round(report.blitzRate * 100)}% Blitz)
            </h3>
            {report.coverages.slice(0, 4).map((entry) => (
              <Bar key={entry.key} entry={entry} />
            ))}
          </div>
        ))}
      </section>

      <section className="scouting-analysis__section">
        <h2>Schwachstellen-Vorschläge</h2>
        {suggestions.length === 0 && <p className="scouting-analysis__empty">Noch keine klare Tendenz erkennbar (mehr Snaps erfassen).</p>}
        {suggestions.map((s) => (
          <p key={s.situation} className="scouting-analysis__suggestion">
            <strong>
              {SITUATION_LABELS[s.situation]}: {Math.round(s.coveragePct * 100)}% {s.coverageName}
            </strong>{" "}
            → Vorschlag: {s.concepts.join(", ")}
          </p>
        ))}
      </section>

      <button type="button" className="scouting-analysis__train" onClick={handleTrainAgainstOpponent}>
        Trainiere gegen {opponent.name}
      </button>
    </div>
  );
}
