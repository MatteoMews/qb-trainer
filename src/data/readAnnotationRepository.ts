import { db } from "./db";

/** Liefert die Schlüssel-Verteidiger-Markierung für ein (Play, Defense)-Paar, falls vorhanden. */
export async function getKeyDefender(playId: number, defenseId: number): Promise<string | undefined> {
  const existing = await db.readAnnotations.where({ playId, defenseId }).first();
  return existing?.keyDefenderId;
}

/** Setzt (oder löscht mit `defenderId: null`) den Schlüssel-Verteidiger für ein (Play, Defense)-Paar. */
export async function setKeyDefender(playId: number, defenseId: number, defenderId: string | null): Promise<void> {
  const existing = await db.readAnnotations.where({ playId, defenseId }).first();
  const now = new Date().toISOString();
  if (existing?.id !== undefined) {
    await db.readAnnotations.update(existing.id, { keyDefenderId: defenderId ?? undefined, updatedAt: now });
  } else if (defenderId) {
    await db.readAnnotations.add({ playId, defenseId, keyDefenderId: defenderId, updatedAt: now });
  }
}
