/** Positions-Labels für Offense und Defense. */

export const OFFENSE_POSITIONS = [
  "QB",
  "RB",
  "FB",
  "WR", // generisches Label, wenn kein spezifisches X/Z/H/F/Y vorliegt
  "X", // Split End (zum Boundary/Field je nach Formation)
  "Z", // Flanker
  "H", // Slot/H-Back
  "F", // zusätzlicher Flex-Receiver/H-Back
  "Y", // Tight End (in-line)
  "TE",
  "LT",
  "LG",
  "C",
  "RG",
  "RT",
] as const;

export type OffensePosition = (typeof OFFENSE_POSITIONS)[number];

export const DEFENSE_POSITIONS = [
  "DE",
  "DT",
  "NT",
  "OLB",
  "MLB",
  "ILB",
  "CB",
  "NB", // Nickel-Back
  "FS",
  "SS",
  "S",
] as const;

export type DefensePosition = (typeof DEFENSE_POSITIONS)[number];
