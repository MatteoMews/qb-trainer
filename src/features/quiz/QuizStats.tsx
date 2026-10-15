import { useEffect, useState } from "react";
import { computeStats, type AccuracyStat } from "../../data/quizRepository";
import "./QuizStats.css";

function StatTable({ title, stats }: { title: string; stats: AccuracyStat[] }) {
  if (stats.length === 0) return null;
  return (
    <div className="quiz-stats__table">
      <h3>{title}</h3>
      <table>
        <tbody>
          {stats.map((s) => (
            <tr key={s.key}>
              <td>{s.key}</td>
              <td>
                {s.correct}/{s.total}
              </td>
              <td>{Math.round(s.accuracy * 100)}%</td>
              <td>{(s.avgReactionTimeMs / 1000).toFixed(1)}s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Trefferquote pro Coverage/Konzept/Fragetyp, Reaktionszeit, Verlauf (Projektauftrag 5.6). */
export function QuizStats() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof computeStats>> | null>(null);

  useEffect(() => {
    let cancelled = false;
    computeStats().then((data) => {
      if (!cancelled) setStats(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats) return null;
  const hasAny = stats.byCoverage.length > 0 || stats.byConcept.length > 0 || stats.byQuestionType.length > 0;
  if (!hasAny) return <p className="quiz-stats__empty">Noch keine Quiz-Historie. Starte eine Runde!</p>;

  return (
    <div className="quiz-stats">
      <StatTable title="Nach Coverage (schwächste zuerst)" stats={stats.byCoverage} />
      <StatTable title="Nach Konzept (schwächste zuerst)" stats={stats.byConcept} />
      <StatTable title="Nach Fragetyp" stats={stats.byQuestionType} />
    </div>
  );
}
