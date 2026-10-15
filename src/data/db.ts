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

export class QbTrainerDb extends Dexie {
  plays!: Table<SavedPlay, number>;
  defenses!: Table<SavedDefense, number>;

  constructor() {
    super("qb-trainer");
    this.version(1).stores({
      plays: "++id, data.name, folder, updatedAt",
    });
    this.version(2).stores({
      plays: "++id, data.name, folder, updatedAt",
      defenses: "++id, data.name, folder, updatedAt",
    });
  }
}

export const db = new QbTrainerDb();
