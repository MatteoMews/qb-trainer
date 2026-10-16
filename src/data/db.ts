import Dexie, { type Table } from "dexie";
import type { Play } from "./playSchema";
import type { Defense } from "./defenseSchema";
import type { Hash } from "./field";

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

export interface Opponent {
  id?: number;
  name: string;
  league: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

/** Ein einzelner erfasster Snap aus dem Gegner-Video (Projektauftrag 5.7). Front/Coverage
 *  referenzieren nach Möglichkeit die Namen aus fronts.ts/coverages.ts, damit die Auswertung
 *  die vorhandenen Beater-Konzepte nutzen kann - "Unbekannt" ist immer erlaubt (Daten aus Video
 *  sind oft unvollständig). */
export interface Snap {
  id?: number;
  opponentId: number;
  down: 1 | 2 | 3 | 4;
  distance: number;
  fieldPosition: number;
  hash: Hash;
  offensePersonnel?: string;
  defenseFront: string;
  coverage: string;
  blitz: boolean;
  blitzType?: string;
  result: string;
  notes?: string;
  createdAt: string;
}

/** Verknüpft einen gespeicherten Play mit einer gespeicherten Defense: welcher Verteidiger ist
 *  gegen diese Defense der Schlüssel-Read (Reads-Tab "Meine Spielzüge"). Lokal/geräte-gebunden
 *  wie Scouting-Snaps, da Play-/Defense-IDs zwischen Geräten nicht stabil sind - kein Teil des
 *  portablen Play-Exports (siehe playSchema.ts `qbReadNotes` für den portablen Teil). */
export interface ReadAnnotation {
  id?: number;
  playId: number;
  defenseId: number;
  keyDefenderId?: string;
  updatedAt: string;
}

export class QbTrainerDb extends Dexie {
  plays!: Table<SavedPlay, number>;
  defenses!: Table<SavedDefense, number>;
  quizAttempts!: Table<QuizAttempt, number>;
  opponents!: Table<Opponent, number>;
  snaps!: Table<Snap, number>;
  readAnnotations!: Table<ReadAnnotation, number>;

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
    this.version(4).stores({
      plays: "++id, data.name, folder, updatedAt",
      defenses: "++id, data.name, folder, updatedAt",
      quizAttempts: "++id, questionType, concept, coverage, timestamp",
      opponents: "++id, name, updatedAt",
      snaps: "++id, opponentId, down, coverage, createdAt",
    });
    this.version(5).stores({
      plays: "++id, data.name, folder, updatedAt",
      defenses: "++id, data.name, folder, updatedAt",
      quizAttempts: "++id, questionType, concept, coverage, timestamp",
      opponents: "++id, name, updatedAt",
      snaps: "++id, opponentId, down, coverage, createdAt",
      readAnnotations: "++id, [playId+defenseId], playId, defenseId",
    });
  }
}

export const db = new QbTrainerDb();
