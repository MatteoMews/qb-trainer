import { z } from "zod";
import { PlaySchema } from "./playSchema";
import { DefenseSchema } from "./defenseSchema";

/** Zod-Schema für das Komplett-Backup (Projektauftrag 5.9): eine Datei mit allen Spielzügen,
 *  Defenses, Gegnern und der Quiz-Statistik. Siehe docs/import-format.md.
 *
 * Snaps referenzieren ihren Gegner über `opponentRef` (Index in `opponents`, 0-basiert) statt
 * über die rohe Datenbank-ID, weil IDs beim Import in eine andere Datenbank nicht stabil sind. */

export const BackupOpponentSchema = z.object({
  name: z.string().min(1),
  league: z.string(),
  notes: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const BackupSnapSchema = z.object({
  opponentRef: z.number().int().min(0),
  down: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  distance: z.number(),
  fieldPosition: z.number(),
  hash: z.enum(["left", "middle", "right"]),
  offensePersonnel: z.string().optional(),
  defenseFront: z.string(),
  coverage: z.string(),
  blitz: z.boolean(),
  blitzType: z.string().optional(),
  result: z.string(),
  notes: z.string().optional(),
  createdAt: z.string(),
});

export const BackupQuizAttemptSchema = z.object({
  timestamp: z.string(),
  questionType: z.enum(["pre-snap", "post-snap-receiver", "progression-order", "beater", "disguise"]),
  concept: z.string().optional(),
  coverage: z.string().optional(),
  correct: z.boolean(),
  timedOut: z.boolean(),
  reactionTimeMs: z.number(),
});

export const BackupPlaySchema = z.object({
  data: PlaySchema,
  folder: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const BackupDefenseSchema = z.object({
  data: DefenseSchema,
  folder: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const BackupSchema = z.object({
  schemaVersion: z.literal(1),
  type: z.literal("qb-trainer-backup"),
  exportedAt: z.string(),
  plays: z.array(BackupPlaySchema),
  defenses: z.array(BackupDefenseSchema),
  opponents: z.array(BackupOpponentSchema),
  snaps: z.array(BackupSnapSchema),
  quizAttempts: z.array(BackupQuizAttemptSchema),
});
export type Backup = z.infer<typeof BackupSchema>;
