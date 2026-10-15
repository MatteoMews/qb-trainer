import type { AnsweredQuestion } from "./quizStore";
import "./QuestionResolution.css";

export interface QuestionResolutionProps {
  entry: AnsweredQuestion;
  onNext: () => void;
  isLast: boolean;
}

export function QuestionResolution({ entry, onNext, isLast }: QuestionResolutionProps) {
  return (
    <div className={entry.correct ? "question-resolution question-resolution--correct" : "question-resolution question-resolution--wrong"}>
      <h3>
        {entry.timedOut ? "Zeit abgelaufen ⏱" : entry.correct ? "Richtig ✓" : "Leider falsch ✗"}
        <span className="question-resolution__time">{(entry.reactionTimeMs / 1000).toFixed(1)}s</span>
      </h3>
      <p>{entry.question.explanation}</p>
      <button type="button" onClick={onNext}>
        {isLast ? "Ergebnis anzeigen" : "Nächste Frage"}
      </button>
    </div>
  );
}
