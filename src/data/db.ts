import Dexie, { type Table } from "dexie";
import type { Play } from "./playSchema";

export interface SavedPlay {
  id?: number;
  data: Play;
  folder: string;
  createdAt: string;
  updatedAt: string;
}

export class QbTrainerDb extends Dexie {
  plays!: Table<SavedPlay, number>;

  constructor() {
    super("qb-trainer");
    this.version(1).stores({
      plays: "++id, data.name, folder, updatedAt",
    });
  }
}

export const db = new QbTrainerDb();
