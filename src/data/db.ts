import Dexie, { type Table } from "dexie";
import type { Play } from "./playSchema";
import type { Defense } from "./defenseSchema";

export interface SavedPlay {
  id?: number;
  data: Play;
  folder: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedDefense {
  id?: number;
  data: Defense;
  folder: string;
  createdAt: string;
  updatedAt: string;
}

export type QuizQuestionType = "pre-snap" | "post-snap-receiver" | "progression-order" | "beater" | "disguise";

export interface QuizAttempt {
  id?: number;
  timestamp: string;
  questionType: QuizQuestionType;
  concept?: string;
  coverage?: string;
  correct: boolean;
  timedOut: boolean;
  reactionTimeMs: number;
}

export class QbTrainerDb extends Dexie {
  plays!: Table<SavedPlay, number>;
  defenses!: Table<SavedDefense, number>;
  quizAttempts!: Table<QuizAttempt, number>;

  constructor() {
    super("qb-trainer");
    this.version(1).stores({
      plays: "++id, data.name, folder, updatedAt",
    });
    this.version(2).stores({
      plays: "++id, data.name, folder, updatedAt",
      defenses: "++id, data.name, folder, updatedAt",
    });
    this.version(3).stores({
      plays: "++id, data.name, folder, updatedAt",
      defenses: "++id, data.name, folder, updatedAt",
      quizAttempts: "++id, questionType, concept, coverage, timestamp",
    });
  }
}

export const db = new QbTrainerDb();
