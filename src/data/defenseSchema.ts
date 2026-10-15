import { z } from "zod";
import { PointSchema } from "./schemas";

/** Zod-Schema für das Defense-Austauschformat, siehe docs/import-format.md. */

export const DefensePlayerSchema = z.object({
  id: z.string(),
  position: z.string(),
  start: PointSchema,
  role: z.string().optional(),
});
export type DefensePlayer = z.infer<typeof DefensePlayerSchema>;

export const DefenseSchema = z.object({
  schemaVersion: z.literal(1),
  type: z.literal("defense"),
  name: z.string().min(1),
  tags: z.array(z.string()).default([]),
  front: z.string(),
  coverage: z.string(),
  pressure: z.string().optional(),
  /** Pre-Snap-Disguise: zeigt eine andere Coverage als die tatsächlich gespielte. */
  disguisedAsCoverage: z.string().optional(),
  players: z.array(DefensePlayerSchema),
  notes: z.string().optional(),
});
export type Defense = z.infer<typeof DefenseSchema>;
