import { create } from "zustand";
import type { QuizQuestionType } from "../../data/db";
import { accuracyByConcept, accuracyByCoverage, recordAttempt } from "../../data/quizRepository";
import { listMyConceptNames } from "../../data/playbookRepository";
import { checkAnswer, generateRandomQuestion, type QuizAnswer, type QuizQuestion } from "../../engine/quizGenerators";

export const ALL_QUESTION_TYPES: readonly QuizQuestionType[] = [
  "pre-snap",
  "post-snap-receiver",
  "progression-order",
  "beater",
  "disguise",
];

export type TimePressure = "off" | 2 | 3 | 4;

export interface QuizSetup {
  questionTypes: QuizQuestionType[];
  timePressure: TimePressure;
  coverageNames: string[];
  onlyMyPlays: boolean;
  questionCount: number;
}

export interface AnsweredQuestion {
  question: QuizQuestion;
  answer: QuizAnswer | null;
  correct: boolean;
  timedOut: boolean;
  reactionTimeMs: number;
}

export type QuizPhase = "setup" | "question" | "resolution" | "summary";

interface QuizState {
  setup: QuizSetup;
  phase: QuizPhase;
  currentQuestion: QuizQuestion | null;
  questionIndex: number;
  questionStartedAt: number | null;
  history: AnsweredQuestion[];

  updateSetup(partial: Partial<QuizSetup>): void;
  startQuiz(): Promise<void>;
  submitAnswer(answer: QuizAnswer): Promise<void>;
  handleTimeout(): Promise<void>;
  nextQuestion(): Promise<void>;
  restart(): void;
}

const DEFAULT_SETUP: QuizSetup = {
  questionTypes: [...ALL_QUESTION_TYPES],
  timePressure: "off",
  coverageNames: [],
  onlyMyPlays: false,
  questionCount: 10,
};

async function pickNextQuestion(setup: QuizSetup): Promise<QuizQuestion | null> {
  const [accCoverage, accConcept, myConcepts] = await Promise.all([
    accuracyByCoverage(),
    accuracyByConcept(),
    setup.onlyMyPlays ? listMyConceptNames() : Promise.resolve(undefined),
  ]);

  return generateRandomQuestion(
    setup.questionTypes,
    {
      coverageNames: setup.coverageNames.length > 0 ? setup.coverageNames : undefined,
      conceptNames: myConcepts && myConcepts.length > 0 ? myConcepts : undefined,
    },
    accCoverage,
    accConcept,
  );
}

async function finishQuestion(
  get: () => QuizState,
  set: (partial: Partial<QuizState>) => void,
  answer: QuizAnswer | null,
  timedOut: boolean,
): Promise<void> {
  const state = get();
  const question = state.currentQuestion;
  if (!question || state.phase !== "question") return;

  const reactionTimeMs = state.questionStartedAt ? Date.now() - state.questionStartedAt : 0;
  const correct = !timedOut && answer !== null && checkAnswer(question, answer);

  await recordAttempt({
    questionType: question.type,
    concept: question.concept,
    coverage: question.coverage,
    correct,
    timedOut,
    reactionTimeMs,
  });

  const entry: AnsweredQuestion = { question, answer, correct, timedOut, reactionTimeMs };
  set({ phase: "resolution", history: [...state.history, entry] });
}

export const useQuizStore = create<QuizState>((set, get) => ({
  setup: DEFAULT_SETUP,
  phase: "setup",
  currentQuestion: null,
  questionIndex: 0,
  questionStartedAt: null,
  history: [],

  updateSetup: (partial) => set((state) => ({ setup: { ...state.setup, ...partial } })),

  startQuiz: async () => {
    set({ history: [], questionIndex: 0 });
    const question = await pickNextQuestion(get().setup);
    set({
      currentQuestion: question,
      phase: question ? "question" : "setup",
      questionStartedAt: question ? Date.now() : null,
    });
  },

  submitAnswer: async (answer) => {
    await finishQuestion(get, set, answer, false);
  },

  handleTimeout: async () => {
    await finishQuestion(get, set, null, true);
  },

  nextQuestion: async () => {
    const state = get();
    const nextIndex = state.questionIndex + 1;
    if (nextIndex >= state.setup.questionCount) {
      set({ phase: "summary", currentQuestion: null });
      return;
    }
    const question = await pickNextQuestion(state.setup);
    set({
      questionIndex: nextIndex,
      currentQuestion: question,
      phase: question ? "question" : "summary",
      questionStartedAt: question ? Date.now() : null,
    });
  },

  restart: () => set({ setup: DEFAULT_SETUP, phase: "setup", currentQuestion: null, questionIndex: 0, history: [], questionStartedAt: null }),
}));
