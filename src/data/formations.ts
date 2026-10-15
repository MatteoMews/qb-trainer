import type { Yards } from "./field";
import type { OffensePosition } from "./positions";

/**
 * // TODO(Football-Check): Alle dx/y-Werte sind plausible Richtwerte für Splits, Tiefen und
 * // Abstände (z.B. WR-Split ~22-24 yd von der Mitte, Shotgun-Tiefe ~5 yd). Sie folgen keinem
 * // bestimmten Playbook und sollten von dir geprüft werden.
 *
 * Koordinaten sind relativ zum Ball: dx = seitlicher Abstand zur Mitte (positiv = zur
 * "rechten" Feldseite aus Offense-Sicht), y = Abstand zur Line of Scrimmage (0 = auf der
 * Linie, negativ = im Backfield). Erst bei der Platzierung einer Formation auf dem Feld
 * (siehe engine/formationPlacement.ts) wird daraus eine absolute Position, abhängig vom Hash.
 */

export interface FormationPlayer {
  /** Alignment-Label, wie es auf dem Feld angezeigt wird (X, Z, H, F, Y, RB, FB, QB, OL-Spots). */
  id: string;
  position: OffensePosition;
  offset: { dx: Yards; y: Yards };
}

export type QbAlignment = "under-center" | "shotgun" | "pistol";

export interface Formation {
  name: string;
  personnel: string;
  qbAlignment: QbAlignment;
  description: string;
  players: readonly FormationPlayer[];
}

const OL_LINE: readonly FormationPlayer[] = [
  { id: "LT", position: "LT", offset: { dx: -4, y: 0 } },
  { id: "LG", position: "LG", offset: { dx: -2, y: 0 } },
  { id: "C", position: "C", offset: { dx: 0, y: 0 } },
  { id: "RG", position: "RG", offset: { dx: 2, y: 0 } },
  { id: "RT", position: "RT", offset: { dx: 4, y: 0 } },
];

export const FORMATIONS: readonly Formation[] = [
  {
    name: "Doubles (2x2)",
    personnel: "11",
    qbAlignment: "shotgun",
    description: "Shotgun, je 2 Receiver pro Seite (TE+WR rechts, 2 WR links).",
    players: [
      { id: "QB", position: "QB", offset: { dx: 0, y: -5 } },
      { id: "RB", position: "RB", offset: { dx: -1.5, y: -5.3 } },
      ...OL_LINE,
      { id: "Y", position: "TE", offset: { dx: 5.5, y: 0 } },
      { id: "Z", position: "WR", offset: { dx: 24, y: -1 } },
      { id: "X", position: "WR", offset: { dx: -24, y: -1 } },
      { id: "F", position: "WR", offset: { dx: -9, y: -1 } },
    ],
  },
  {
    name: "Trips Right (3x1)",
    personnel: "11",
    qbAlignment: "shotgun",
    description: "Shotgun, drei Receiver rechts (TE inline, Slot, Outside), ein Receiver links.",
    players: [
      { id: "QB", position: "QB", offset: { dx: 0, y: -5 } },
      { id: "RB", position: "RB", offset: { dx: -1.5, y: -5.3 } },
      ...OL_LINE,
      { id: "X", position: "WR", offset: { dx: -24, y: -1 } },
      { id: "Y", position: "TE", offset: { dx: 5.5, y: 0 } },
      { id: "H", position: "WR", offset: { dx: 10, y: -1 } },
      { id: "Z", position: "WR", offset: { dx: 24, y: -1 } },
    ],
  },
  {
    name: "Trips Bunch Right",
    personnel: "11",
    qbAlignment: "shotgun",
    description: "Shotgun, drei Receiver rechts eng gestaffelt (Bunch), ein Receiver links.",
    players: [
      { id: "QB", position: "QB", offset: { dx: 0, y: -5 } },
      { id: "RB", position: "RB", offset: { dx: -1.5, y: -5.3 } },
      ...OL_LINE,
      { id: "X", position: "WR", offset: { dx: -24, y: -1 } },
      { id: "Y", position: "TE", offset: { dx: 8, y: 0 } },
      { id: "H", position: "WR", offset: { dx: 7, y: -1.5 } },
      { id: "Z", position: "WR", offset: { dx: 9, y: -3 } },
    ],
  },
  {
    name: "Empty (3x2)",
    personnel: "00",
    qbAlignment: "shotgun",
    description: "Shotgun ohne RB im Backfield, fünf Receiver verteilt 3 rechts / 2 links.",
    players: [
      { id: "QB", position: "QB", offset: { dx: 0, y: -5 } },
      ...OL_LINE,
      { id: "X", position: "WR", offset: { dx: -24, y: -1 } },
      { id: "F", position: "WR", offset: { dx: -10, y: -1 } },
      { id: "Y", position: "WR", offset: { dx: 5.5, y: -1 } },
      { id: "H", position: "WR", offset: { dx: 10, y: -1 } },
      { id: "Z", position: "WR", offset: { dx: 24, y: -1 } },
    ],
  },
  {
    name: "Stack Right",
    personnel: "11",
    qbAlignment: "shotgun",
    description: "Shotgun, zwei Receiver rechts vertikal gestapelt (Stack), TE und Split End links.",
    players: [
      { id: "QB", position: "QB", offset: { dx: 0, y: -5 } },
      { id: "RB", position: "RB", offset: { dx: -1.5, y: -5.3 } },
      ...OL_LINE,
      { id: "Y", position: "TE", offset: { dx: -5.5, y: 0 } },
      { id: "X", position: "WR", offset: { dx: -22, y: -1 } },
      { id: "Z", position: "WR", offset: { dx: 22, y: -1 } },
      { id: "H", position: "WR", offset: { dx: 22, y: -3 } },
    ],
  },
  {
    name: "Twins Right",
    personnel: "21",
    qbAlignment: "under-center",
    description: "Under Center, zwei Backs (I-artig), TE links, zwei Receiver (Twins) rechts.",
    players: [
      { id: "QB", position: "QB", offset: { dx: 0, y: -1.3 } },
      { id: "FB", position: "FB", offset: { dx: 0.5, y: -4 } },
      { id: "RB", position: "RB", offset: { dx: 0, y: -7 } },
      ...OL_LINE,
      { id: "Y", position: "TE", offset: { dx: -5.5, y: 0 } },
      { id: "H", position: "WR", offset: { dx: 14, y: -1 } },
      { id: "Z", position: "WR", offset: { dx: 24, y: -1 } },
    ],
  },
  {
    name: "Pro Right (Slot)",
    personnel: "21",
    qbAlignment: "under-center",
    description: "Under Center, Split Backs, TE rechts, Split End links, Flanker/Slot rechts.",
    players: [
      { id: "QB", position: "QB", offset: { dx: 0, y: -1.3 } },
      { id: "RB", position: "RB", offset: { dx: -6, y: -5.5 } },
      { id: "FB", position: "FB", offset: { dx: 5, y: -4.5 } },
      ...OL_LINE,
      { id: "Y", position: "TE", offset: { dx: 5.5, y: 0 } },
      { id: "X", position: "WR", offset: { dx: -24, y: -1 } },
      { id: "Z", position: "WR", offset: { dx: 20, y: -1 } },
    ],
  },
  {
    name: "I-Form Pro",
    personnel: "21",
    qbAlignment: "under-center",
    description: "Under Center, FB und RB gestapelt hinter dem QB (I-Formation), TE rechts, 2 WR gesplittet.",
    players: [
      { id: "QB", position: "QB", offset: { dx: 0, y: -1.3 } },
      { id: "FB", position: "FB", offset: { dx: 0, y: -4 } },
      { id: "RB", position: "RB", offset: { dx: 0, y: -7 } },
      ...OL_LINE,
      { id: "Y", position: "TE", offset: { dx: 5.5, y: 0 } },
      { id: "X", position: "WR", offset: { dx: -24, y: -1 } },
      { id: "Z", position: "WR", offset: { dx: 24, y: -1 } },
    ],
  },
  {
    name: "Pistol Trips",
    personnel: "11",
    qbAlignment: "pistol",
    description: "Pistol, RB direkt hinter dem QB, TE rechts, zwei Receiver links, ein Receiver rechts.",
    players: [
      { id: "QB", position: "QB", offset: { dx: 0, y: -4 } },
      { id: "RB", position: "RB", offset: { dx: 0, y: -7 } },
      ...OL_LINE,
      { id: "Y", position: "TE", offset: { dx: 5.5, y: 0 } },
      { id: "X", position: "WR", offset: { dx: -24, y: -1 } },
      { id: "H", position: "WR", offset: { dx: -10, y: -1 } },
      { id: "Z", position: "WR", offset: { dx: 24, y: -1 } },
    ],
  },
  {
    name: "Shotgun (10 Personnel)",
    personnel: "10",
    qbAlignment: "shotgun",
    description: "Shotgun, kein TE, vier Receiver 2x2 verteilt.",
    players: [
      { id: "QB", position: "QB", offset: { dx: 0, y: -5 } },
      { id: "RB", position: "RB", offset: { dx: -1.5, y: -5.3 } },
      ...OL_LINE,
      { id: "X", position: "WR", offset: { dx: -24, y: -1 } },
      { id: "F", position: "WR", offset: { dx: -9, y: -1 } },
      { id: "H", position: "WR", offset: { dx: 9, y: -1 } },
      { id: "Z", position: "WR", offset: { dx: 24, y: -1 } },
    ],
  },
  {
    name: "Under Center (12 Personnel)",
    personnel: "12",
    qbAlignment: "under-center",
    description: "Under Center, ein RB, zwei Tight Ends (beidseitig inline), zwei gesplittete WR.",
    players: [
      { id: "QB", position: "QB", offset: { dx: 0, y: -1.3 } },
      { id: "RB", position: "RB", offset: { dx: 0, y: -6 } },
      ...OL_LINE,
      { id: "Y", position: "TE", offset: { dx: 5.5, y: 0 } },
      { id: "U", position: "TE", offset: { dx: -5.5, y: 0 } },
      { id: "X", position: "WR", offset: { dx: -24, y: -1 } },
      { id: "Z", position: "WR", offset: { dx: 24, y: -1 } },
    ],
  },
];

export function findFormation(name: string): Formation | undefined {
  return FORMATIONS.find((formation) => formation.name === name);
}

/** Spiegelt eine Formation horizontal (links/rechts tauschen). Alignment-Labels (X/Z/H/...)
 *  bleiben als feste Identifier erhalten; nur die Positionen werden gespiegelt. */
export function mirrorFormation(formation: Formation): Formation {
  return {
    ...formation,
    name: mirrorName(formation.name),
    players: formation.players.map((player) => ({
      ...player,
      offset: { dx: -player.offset.dx, y: player.offset.y },
    })),
  };
}

function mirrorName(name: string): string {
  if (name.includes("Right")) return name.replace("Right", "Left");
  if (name.includes("Left")) return name.replace("Left", "Right");
  return `${name} (gespiegelt)`;
}
