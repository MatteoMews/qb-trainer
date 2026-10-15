import { db, type Opponent, type QuizAttempt, type Snap } from "./db";
import { BackupSchema, type Backup } from "./backupSchema";
import { downloadJson } from "./downloadFile";

const LAST_BACKUP_KEY = "qb-trainer:last-backup-at";

export function getLastBackupAt(): string | null {
  try {
    return localStorage.getItem(LAST_BACKUP_KEY);
  } catch {
    return null;
  }
}

function setLastBackupAt(iso: string): void {
  try {
    localStorage.setItem(LAST_BACKUP_KEY, iso);
  } catch {
    // localStorage kann in privaten Fenstern o.ä. fehlschlagen - der Export selbst
    // funktioniert trotzdem, nur der "letztes Backup"-Hinweis fehlt dann.
  }
}

export async function buildBackup(): Promise<Backup> {
  const [plays, defenses, opponents, snaps, quizAttempts] = await Promise.all([
    db.plays.toArray(),
    db.defenses.toArray(),
    db.opponents.toArray(),
    db.snaps.toArray(),
    db.quizAttempts.toArray(),
  ]);

  const opponentIndexById = new Map(opponents.map((o, index) => [o.id!, index]));

  return {
    schemaVersion: 1,
    type: "qb-trainer-backup",
    exportedAt: new Date().toISOString(),
    plays: plays.map(({ data, folder, createdAt, updatedAt }) => ({ data, folder, createdAt, updatedAt })),
    defenses: defenses.map(({ data, folder, createdAt, updatedAt }) => ({ data, folder, createdAt, updatedAt })),
    opponents: opponents.map(({ name, league, notes, createdAt, updatedAt }) => ({ name, league, notes, createdAt, updatedAt })),
    snaps: snaps
      .filter((s) => opponentIndexById.has(s.opponentId))
      .map((s) => ({
        opponentRef: opponentIndexById.get(s.opponentId)!,
        down: s.down,
        distance: s.distance,
        fieldPosition: s.fieldPosition,
        hash: s.hash,
        offensePersonnel: s.offensePersonnel,
        defenseFront: s.defenseFront,
        coverage: s.coverage,
        blitz: s.blitz,
        blitzType: s.blitzType,
        result: s.result,
        notes: s.notes,
        createdAt: s.createdAt,
      })),
    quizAttempts: quizAttempts.map(({ timestamp, questionType, concept, coverage, correct, timedOut, reactionTimeMs }) => ({
      timestamp,
      questionType,
      concept,
      coverage,
      correct,
      timedOut,
      reactionTimeMs,
    })),
  };
}

export async function downloadBackup(): Promise<void> {
  const backup = await buildBackup();
  downloadJson(`qb-trainer-backup-${backup.exportedAt.slice(0, 10)}.json`, backup);
  setLastBackupAt(backup.exportedAt);
}

export interface ImportSummary {
  playsAdded: number;
  playsSkipped: number;
  defensesAdded: number;
  defensesSkipped: number;
  opponentsAdded: number;
  opponentsMatched: number;
  snapsAdded: number;
  snapsSkipped: number;
  quizAttemptsAdded: number;
  quizAttemptsSkipped: number;
}

export type ParseBackupResult = { success: true; backup: Backup } | { success: false; error: string };

export function parseBackup(raw: unknown): ParseBackupResult {
  const result = BackupSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") };
  }
  return { success: true, backup: result.data };
}

/** Importiert ein Backup additiv ("Zusammenführen", Projektauftrag 5.9): erkennt Duplikate
 *  über Inhaltsvergleich (nicht über IDs, die zwischen Geräten nicht übereinstimmen) und fügt
 *  nur wirklich neue Einträge hinzu. */
export async function importBackup(backup: Backup): Promise<ImportSummary> {
  const summary: ImportSummary = {
    playsAdded: 0,
    playsSkipped: 0,
    defensesAdded: 0,
    defensesSkipped: 0,
    opponentsAdded: 0,
    opponentsMatched: 0,
    snapsAdded: 0,
    snapsSkipped: 0,
    quizAttemptsAdded: 0,
    quizAttemptsSkipped: 0,
  };

  await db.transaction("rw", db.plays, db.defenses, db.opponents, db.snaps, db.quizAttempts, async () => {
    const existingPlays = await db.plays.toArray();
    const existingPlayHashes = new Set(existingPlays.map((p) => JSON.stringify(p.data)));
    for (const play of backup.plays) {
      const hash = JSON.stringify(play.data);
      if (existingPlayHashes.has(hash)) {
        summary.playsSkipped++;
        continue;
      }
      await db.plays.add(play);
      existingPlayHashes.add(hash);
      summary.playsAdded++;
    }

    const existingDefenses = await db.defenses.toArray();
    const existingDefenseHashes = new Set(existingDefenses.map((d) => JSON.stringify(d.data)));
    for (const defense of backup.defenses) {
      const hash = JSON.stringify(defense.data);
      if (existingDefenseHashes.has(hash)) {
        summary.defensesSkipped++;
        continue;
      }
      await db.defenses.add(defense);
      existingDefenseHashes.add(hash);
      summary.defensesAdded++;
    }

    const existingOpponents = await db.opponents.toArray();
    const opponentIdByName = new Map(existingOpponents.map((o) => [o.name, o.id!]));
    const newOpponentIdByRef = new Map<number, number>();
    for (let i = 0; i < backup.opponents.length; i++) {
      const incoming = backup.opponents[i];
      const existingId = opponentIdByName.get(incoming.name);
      if (existingId !== undefined) {
        newOpponentIdByRef.set(i, existingId);
        summary.opponentsMatched++;
        continue;
      }
      const newId = await db.opponents.add(incoming as Opponent);
      opponentIdByName.set(incoming.name, newId);
      newOpponentIdByRef.set(i, newId);
      summary.opponentsAdded++;
    }

    const existingSnaps = await db.snaps.toArray();
    const existingSnapHashes = new Set(existingSnaps.map((s) => JSON.stringify({ ...s, id: undefined })));
    for (const snap of backup.snaps) {
      const opponentId = newOpponentIdByRef.get(snap.opponentRef);
      if (opponentId === undefined) {
        summary.snapsSkipped++;
        continue;
      }
      const candidate: Omit<Snap, "id"> = {
        opponentId,
        down: snap.down,
        distance: snap.distance,
        fieldPosition: snap.fieldPosition,
        hash: snap.hash,
        offensePersonnel: snap.offensePersonnel,
        defenseFront: snap.defenseFront,
        coverage: snap.coverage,
        blitz: snap.blitz,
        blitzType: snap.blitzType,
        result: snap.result,
        notes: snap.notes,
        createdAt: snap.createdAt,
      };
      const hash = JSON.stringify({ ...candidate, id: undefined });
      if (existingSnapHashes.has(hash)) {
        summary.snapsSkipped++;
        continue;
      }
      await db.snaps.add(candidate as Snap);
      existingSnapHashes.add(hash);
      summary.snapsAdded++;
    }

    const existingAttempts = await db.quizAttempts.toArray();
    const existingAttemptHashes = new Set(existingAttempts.map((a) => JSON.stringify({ ...a, id: undefined })));
    for (const attempt of backup.quizAttempts) {
      const hash = JSON.stringify({ ...attempt, id: undefined });
      if (existingAttemptHashes.has(hash)) {
        summary.quizAttemptsSkipped++;
        continue;
      }
      await db.quizAttempts.add(attempt as QuizAttempt);
      existingAttemptHashes.add(hash);
      summary.quizAttemptsAdded++;
    }
  });

  return summary;
}
