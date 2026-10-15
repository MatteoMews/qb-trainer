/** NCAA-Feldmaße und Hash-Positionen, in Yards. Einheitliches Koordinatensystem:
 *  x = 0..FIELD_WIDTH_YD quer zum Feld (linke bis rechte Seitenlinie aus Sicht der Offense)
 *  y = Abstand zur Line of Scrimmage, positiv = Richtung Defense. */

export type Yards = number;

export type Hash = "left" | "middle" | "right";

export const FIELD_WIDTH_YD: Yards = 160 / 3; // 53 1/3 yd
export const PLAYING_FIELD_LENGTH_YD: Yards = 100;
export const END_ZONE_DEPTH_YD: Yards = 10;
export const FIELD_LENGTH_YD: Yards = PLAYING_FIELD_LENGTH_YD + 2 * END_ZONE_DEPTH_YD; // 120 yd

/** NCAA: Hash marks liegen 60 ft (20 yd) von jeder Seitenlinie entfernt. */
export const HASH_FROM_SIDELINE_YD: Yards = 20;

/** Cross-field x-Position (0..FIELD_WIDTH_YD) der jeweiligen Hash-Markierung. */
export function hashX(hash: Hash): Yards {
  switch (hash) {
    case "left":
      return HASH_FROM_SIDELINE_YD;
    case "right":
      return FIELD_WIDTH_YD - HASH_FROM_SIDELINE_YD;
    case "middle":
      return FIELD_WIDTH_YD / 2;
  }
}

/** Yard-Linien, die am Feld beschriftet werden (alle 10 yd, von je einer Endzone aus gezählt). */
export const YARD_NUMBER_LINES: readonly Yards[] = [10, 20, 30, 40, 50, 60, 70, 80, 90];
