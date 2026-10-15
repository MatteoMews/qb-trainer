import { FIELD_WIDTH_YD, type Yards } from "../data/field";
import type { Point } from "../data/schemas";

/**
 * 3D-Weltkoordinaten in Yards (1 Einheit = 1 Yard). x = cross-field, zentriert um 0
 * (0 = Feldmitte, negativ = "links"); y = Höhe über dem Boden; z = downfield, negativ in
 * Richtung Verteidigung (Three.js schaut per Konvention in -Z).
 */
export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

/** Durchschnittliche Augenhöhe eines stehenden Quarterbacks (~1,85 m ≈ 2,0 yd). */
export const QB_EYE_HEIGHT_YD = 1.85 / 0.9144;
/** Grobe Körpergröße für die Spieler-Figuren (~1,85 m). */
export const PLAYER_HEIGHT_YD = 1.85 / 0.9144;

/** Wandelt einen Play-relativen Punkt (x = cross-field, y = Abstand zur LOS) plus die absolute
 *  Yard-Linie des Balls in eine 3D-Weltposition am Boden (y=0) um. */
export function playPointToWorld(point: Point, ballYardLine: Yards): Vec3 {
  const absoluteYardLine = ballYardLine + point.y;
  return {
    x: point.x - FIELD_WIDTH_YD / 2,
    y: 0,
    z: -absoluteYardLine,
  };
}
