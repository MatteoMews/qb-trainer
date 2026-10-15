import { db, type SavedPlay } from "./db";
import type { Play } from "./playSchema";
import { mirrorPlay } from "../engine/mirrorPlay";

const DEFAULT_FOLDER = "Unsortiert";

export function listPlays(): Promise<SavedPlay[]> {
  return db.plays.orderBy("updatedAt").reverse().toArray();
}

export async function savePlay(play: Play, folder: string = DEFAULT_FOLDER): Promise<number> {
  const now = new Date().toISOString();
  return db.plays.add({ data: play, folder, createdAt: now, updatedAt: now });
}

export async function updatePlay(id: number, play: Play): Promise<void> {
  await db.plays.update(id, { data: play, updatedAt: new Date().toISOString() });
}

export async function renamePlay(id: number, name: string): Promise<void> {
  const existing = await db.plays.get(id);
  if (!existing) throw new Error(`Play ${id} nicht gefunden`);
  await updatePlay(id, { ...existing.data, name });
}

export async function deletePlay(id: number): Promise<void> {
  await db.plays.delete(id);
}

export async function duplicatePlay(id: number): Promise<number> {
  const existing = await db.plays.get(id);
  if (!existing) throw new Error(`Play ${id} nicht gefunden`);
  return savePlay({ ...existing.data, name: `${existing.data.name} (Kopie)` }, existing.folder);
}

export async function mirrorSavedPlay(id: number): Promise<number> {
  const existing = await db.plays.get(id);
  if (!existing) throw new Error(`Play ${id} nicht gefunden`);
  return savePlay(mirrorPlay(existing.data), existing.folder);
}

export async function movePlayToFolder(id: number, folder: string): Promise<void> {
  await db.plays.update(id, { folder, updatedAt: new Date().toISOString() });
}

export async function listFolders(): Promise<string[]> {
  const plays = await db.plays.toArray();
  return Array.from(new Set(plays.map((play) => play.folder))).sort();
}

/** Konzept-Namen, die in den gespeicherten Spielzügen tatsächlich vorkommen (nur Plays, die
 *  unverändert aus einem Konzept gebaut wurden, siehe playSchema.ts `offense.concept`). Für den
 *  Quiz-Filter "nur meine Spielzüge" (Projektauftrag 5.6). */
export async function listMyConceptNames(): Promise<string[]> {
  const plays = await db.plays.toArray();
  return Array.from(new Set(plays.map((play) => play.data.offense.concept).filter((name): name is string => !!name)));
}
