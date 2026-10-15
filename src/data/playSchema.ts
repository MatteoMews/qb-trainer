import { z } from "zod";
import { BallPositionSchema, HashSchema, PointSchema } from "./schemas";

/** Zod-Schema für das Play-Austauschformat, siehe docs/import-format.md.
 *  `schemaVersion` wird bei inkompatiblen Änderungen hochgezählt. */

export const DROPBACK_TYPES = ["quick", "3-step", "5-step", "7-step", "play-action", "rpo"] as const;
export const QB_ALIGNMENTS = ["under-center", "shotgun", "pistol"] as const;

export const PlayerAssignmentTaskSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("route"),
    routeName: z.string(),
    route: z.array(PointSchema),
    progression: z.number().int().min(1).max(4).optional(),
  }),
  z.object({ type: z.literal("block") }),
]);

export const PlayPlayerSchema = z.object({
  id: z.string(),
  position: z.string(),
  start: PointSchema,
  task: PlayerAssignmentTaskSchema,
});
export type PlayPlayer = z.infer<typeof PlayPlayerSchema>;

export const PlaySchema = z.object({
  schemaVersion: z.literal(1),
  type: z.literal("play"),
  name: z.string().min(1),
  tags: z.array(z.string()).default([]),
  ball: BallPositionSchema,
  offense: z.object({
    formation: z.string(),
    personnel: z.string(),
    qbAlignment: z.enum(QB_ALIGNMENTS),
    dropback: z.enum(DROPBACK_TYPES),
    /** Name des Konzepts aus data/concepts.ts, falls der Play darüber erzeugt wurde (z.B. für
     *  den Quiz-Filter "nur meine Spielzüge", siehe engine/quizGenerators.ts). Optional, weil
     *  frei gezeichnete Plays keinem Konzept entsprechen müssen. */
    concept: z.string().optional(),
    players: z.array(PlayPlayerSchema),
  }),
  notes: z.string().optional(),
});
export type Play = z.infer<typeof PlaySchema>;

export { HashSchema };
