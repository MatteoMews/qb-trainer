import { z } from "zod";
import { FIELD_WIDTH_YD } from "./field";

export const HashSchema = z.enum(["left", "middle", "right"]);

/** Spieler-/Wegpunkt-Position im Play-Koordinatensystem (siehe field.ts). */
export const PointSchema = z.object({
  x: z.number().min(0).max(FIELD_WIDTH_YD),
  y: z.number(),
});
export type Point = z.infer<typeof PointSchema>;

/** Ballposition auf dem Gesamtfeld: Hash plus Yard-Linie (0 = eigene Endzone, 100 = gegnerische). */
export const BallPositionSchema = z.object({
  hash: HashSchema,
  yardLine: z.number().min(0).max(100),
});
export type BallPosition = z.infer<typeof BallPositionSchema>;
