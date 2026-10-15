import { useQuizStore } from "./quizStore";
import "./QuizSummary.css";

export function QuizSummary() {
  const { history, restart } = useQuizStore();
  const correct = history.filter((h) => h.correct).length;
  const avgReaction = history.length > 0 ? history.reduce((sum, h) => sum + h.reactionTimeMs, 0) / history.length / 1000 : 0;

  return (
    <div className="quiz-summary">
      <h2>
        {correct} / {history.length} richtig
      </h2>
      <p>Durchschnittliche Reaktionszeit: {avgReaction.toFixed(1)}s</p>
      <ul className="quiz-summary__list">
        {history.map((entry, index) => (
          <li key={entry.question.id} className={entry.correct ? "quiz-summary__item--correct" : "quiz-summary__item--wrong"}>
            {index + 1}. {entry.question.prompt}
          </li>
        ))}
      </ul>
      <button type="button" onClick={restart}>
        Neues Quiz
      </button>
    </div>
  );
}
