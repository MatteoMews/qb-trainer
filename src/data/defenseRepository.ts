import { db, type SavedDefense } from "./db";
import type { Defense } from "./defenseSchema";

const DEFAULT_FOLDER = "Unsortiert";

export function listDefenses(): Promise<SavedDefense[]> {
  return db.defenses.orderBy("updatedAt").reverse().toArray();
}

export async function saveDefense(defense: Defense, folder: string = DEFAULT_FOLDER): Promise<number> {
  const now = new Date().toISOString();
  return db.defenses.add({ data: defense, folder, createdAt: now, updatedAt: now });
}

export async function renameDefense(id: number, name: string): Promise<void> {
  const existing = await db.defenses.get(id);
  if (!existing) throw new Error(`Defense ${id} nicht gefunden`);
  await db.defenses.update(id, { data: { ...existing.data, name }, updatedAt: new Date().toISOString() });
}

export async function deleteDefense(id: number): Promise<void> {
  await db.defenses.delete(id);
}

export async function duplicateDefense(id: number): Promise<number> {
  const existing = await db.defenses.get(id);
  if (!existing) throw new Error(`Defense ${id} nicht gefunden`);
  return saveDefense({ ...existing.data, name: `${existing.data.name} (Kopie)` }, existing.folder);
}
