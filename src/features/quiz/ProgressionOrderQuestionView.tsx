import { useState } from "react";
import type { ProgressionOrderQuestion } from "../../engine/quizGenerators";
import "./ProgressionOrderQuestionView.css";

export interface ProgressionOrderQuestionViewProps {
  question: ProgressionOrderQuestion;
  disabled: boolean;
  onComplete: (order: string[]) => void;
}

/** Klick-Reihenfolge-Frage: der Nutzer klickt die Progression-Schritte in der Reihenfolge an,
 *  die er für richtig hält. Nach dem letzten Klick wird automatisch ausgewertet. Der Elternteil
 *  muss bei jeder neuen Frage `key={question.id}` vergeben, damit der Auswahlzustand zurückgesetzt wird. */
export function ProgressionOrderQuestionView({ question, disabled, onComplete }: ProgressionOrderQuestionViewProps) {
  const [picked, setPicked] = useState<string[]>([]);

  function handlePick(role: string) {
    if (disabled || picked.includes(role)) return;
    const next = [...picked, role];
    setPicked(next);
    if (next.length === question.shuffledSteps.length) {
      onComplete(next);
    }
  }

  return (
    <div className="progression-question">
      <div className="progression-question__picked">
        {picked.length === 0 && <span className="progression-question__hint">Klicke die Schritte in der richtigen Reihenfolge an.</span>}
        {picked.map((role, index) => {
          const step = question.shuffledSteps.find((s) => s.role === role)!;
          return (
            <span key={role} className="progression-question__picked-item">
              {index + 1}. {role} ({step.routeName})
            </span>
          );
        })}
      </div>
      <div className="progression-question__palette">
        {question.shuffledSteps.map((step) => (
          <button
            key={step.role}
            type="button"
            className="progression-question__option"
            disabled={disabled || picked.includes(step.role)}
            onClick={() => handlePick(step.role)}
          >
            {step.role} – {step.routeName}
          </button>
        ))}
      </div>
    </div>
  );
}
