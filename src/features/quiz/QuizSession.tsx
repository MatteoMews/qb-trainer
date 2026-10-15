import { useState } from "react";
import { MultipleChoiceOptions } from "./MultipleChoiceOptions";
import { PostSnapReceiverQuestionView } from "./PostSnapReceiverQuestionView";
import { ProgressionOrderQuestionView } from "./ProgressionOrderQuestionView";
import { QuestionResolution } from "./QuestionResolution";
import { QuestionTimer } from "./QuestionTimer";
import { QuizDefenseField } from "./QuizDefenseField";
import { useQuizStore } from "./quizStore";
import "./QuizSession.css";

export function QuizSession() {
  const { setup, phase, currentQuestion, questionIndex, history, opponentContext, submitAnswer, handleTimeout, nextQuestion } = useQuizStore();
  const [pendingAnswer, setPendingAnswer] = useState<string | null>(null);

  if (!currentQuestion) return null;

  const disabled = phase === "resolution";
  const lastEntry = history[history.length - 1];

  function handleChoice(option: string) {
    if (disabled) return;
    setPendingAnswer(option);
    submitAnswer(option);
  }

  function handleProgressionComplete(order: string[]) {
    if (disabled) return;
    submitAnswer(order);
  }

  function handleReceiverSelect(roleId: string) {
    if (disabled) return;
    setPendingAnswer(roleId);
    submitAnswer(roleId);
  }

  function goNext() {
    setPendingAnswer(null);
    nextQuestion();
  }

  return (
    <div className="quiz-session">
      <div className="quiz-session__header">
        {opponentContext && <span className="quiz-session__opponent">Trainiere gegen {opponentContext.opponentName}</span>}
        <span>
          Frage {questionIndex + 1} / {setup.questionCount}
        </span>
        {setup.timePressure !== "off" && phase === "question" && (
          <QuestionTimer key={currentQuestion.id} seconds={setup.timePressure} onExpire={handleTimeout} />
        )}
      </div>

      <p className="quiz-session__prompt">{currentQuestion.prompt}</p>

      {currentQuestion.type === "pre-snap" && (
        <>
          <QuizDefenseField front={currentQuestion.front} coverage={currentQuestion.coverageData} hash={currentQuestion.hash} />
          <MultipleChoiceOptions
            options={currentQuestion.options}
            selected={pendingAnswer}
            correctAnswer={currentQuestion.correctAnswer}
            disabled={disabled}
            onSelect={handleChoice}
          />
        </>
      )}

      {currentQuestion.type === "disguise" && (
        <>
          <QuizDefenseField front={currentQuestion.front} coverage={currentQuestion.preSnapCoverage} hash={currentQuestion.hash} />
          <MultipleChoiceOptions
            options={currentQuestion.options}
            selected={pendingAnswer}
            correctAnswer={currentQuestion.correctAnswer}
            disabled={disabled}
            onSelect={handleChoice}
          />
        </>
      )}

      {currentQuestion.type === "beater" && (
        <MultipleChoiceOptions
          options={currentQuestion.options}
          selected={pendingAnswer}
          correctAnswer={currentQuestion.correctAnswer}
          disabled={disabled}
          onSelect={handleChoice}
        />
      )}

      {currentQuestion.type === "progression-order" && (
        <ProgressionOrderQuestionView key={currentQuestion.id} question={currentQuestion} disabled={disabled} onComplete={handleProgressionComplete} />
      )}

      {currentQuestion.type === "post-snap-receiver" && (
        <PostSnapReceiverQuestionView
          key={currentQuestion.id}
          question={currentQuestion}
          disabled={disabled}
          selectedId={pendingAnswer}
          onSelect={handleReceiverSelect}
        />
      )}

      {phase === "resolution" && lastEntry && (
        <QuestionResolution entry={lastEntry} onNext={goNext} isLast={questionIndex + 1 >= setup.questionCount} />
      )}
    </div>
  );
}
