import { useQuizStore } from "./quizStore";
import { QuizSetup } from "./QuizSetup";
import { QuizSession } from "./QuizSession";
import { QuizSummary } from "./QuizSummary";

export function QuizPage() {
  const phase = useQuizStore((state) => state.phase);

  if (phase === "setup") return <QuizSetup />;
  if (phase === "summary") return <QuizSummary />;
  return <QuizSession />;
}
