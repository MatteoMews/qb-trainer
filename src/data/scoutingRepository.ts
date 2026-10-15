import { db, type Opponent, type Snap } from "./db";

export async function listOpponents(): Promise<Opponent[]> {
  return db.opponents.orderBy("updatedAt").reverse().toArray();
}

export async function getOpponent(id: number): Promise<Opponent | undefined> {
  return db.opponents.get(id);
}

export async function createOpponent(name: string, league: string, notes: string): Promise<number> {
  const now = new Date().toISOString();
  return db.opponents.add({ name, league, notes, createdAt: now, updatedAt: now });
}

export async function updateOpponent(id: number, patch: Partial<Pick<Opponent, "name" | "league" | "notes">>): Promise<void> {
  await db.opponents.update(id, { ...patch, updatedAt: new Date().toISOString() });
}

export async function deleteOpponent(id: number): Promise<void> {
  await db.transaction("rw", db.opponents, db.snaps, async () => {
    await db.snaps.where("opponentId").equals(id).delete();
    await db.opponents.delete(id);
  });
}

export async function addSnap(snap: Omit<Snap, "id" | "createdAt">): Promise<number> {
  return db.snaps.add({ ...snap, createdAt: new Date().toISOString() });
}

export async function updateSnap(id: number, patch: Partial<Omit<Snap, "id" | "opponentId" | "createdAt">>): Promise<void> {
  await db.snaps.update(id, patch);
}

export async function deleteSnap(id: number): Promise<void> {
  await db.snaps.delete(id);
}

/** Neueste zuerst. */
export async function listSnaps(opponentId: number): Promise<Snap[]> {
  const snaps = await db.snaps.where("opponentId").equals(opponentId).sortBy("createdAt");
  return snaps.reverse();
}
