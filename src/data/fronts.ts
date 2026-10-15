import type { Yards } from "./field";
import type { DefensePosition } from "./positions";

/**
 * // TODO(Football-Check): Alle dx/y-Werte sind plausible Richtwerte für die Pre-Snap-Tiefe und
 * // -Breite der Front-7 (DL+LB), orientiert an Standard-Techniken (0/1/2i/3/4i/5/6/7/9). Exakte
 * // Splits/Tiefen variieren je nach Team/System und sollten geprüft werden.
 *
 * Koordinaten sind relativ zum Ball, analog zu formations.ts: dx = seitlicher Abstand zur
 * Mitte, y = Abstand zur Line of Scrimmage (positiv = in die Defense hinein).
 *
 * `dbSlots` legt fest, welche Secondary-Rollen (siehe coverages.ts: CB1, CB2, FS, SS, NB, DB6)
 * bei dieser Front tatsächlich besetzt werden - darüber werden Front (Box) und Coverage (DBs)
 * zu einer vollständigen 11-Mann-Defense kombiniert (siehe engine/placeDefense.ts).
 */

export interface FrontPlayer {
  id: string;
  position: DefensePosition;
  technique?: string;
  offset: { dx: Yards; y: Yards };
}

export interface Front {
  name: string;
  personnel: string;
  description: string;
  dbSlots: readonly string[];
  players: readonly FrontPlayer[];
}

export const FRONTS: readonly Front[] = [
  {
    name: "4-3 Over",
    personnel: "4-3",
    description: "Vier-Mann-Front, 3-Technik zur Stärke (TE-Seite) verschoben. Base-Run-Defense gegen Gun/Pro.",
    dbSlots: ["CB1", "CB2", "FS", "SS"],
    players: [
      { id: "LE", position: "DE", technique: "5", offset: { dx: -6, y: 0.7 } },
      { id: "DT1", position: "DT", technique: "3", offset: { dx: -1.5, y: 0.5 } },
      { id: "DT2", position: "DT", technique: "1", offset: { dx: 1.5, y: 0.5 } },
      { id: "RE", position: "DE", technique: "5", offset: { dx: 6, y: 0.7 } },
      { id: "WLB", position: "OLB", offset: { dx: -7, y: 4 } },
      { id: "MLB", position: "MLB", offset: { dx: 0, y: 4.5 } },
      { id: "SLB", position: "OLB", offset: { dx: 7, y: 3.5 } },
    ],
  },
  {
    name: "4-3 Under",
    personnel: "4-3",
    description: "Front von der Stärke weggeschoben (3-Technik schwach), zusätzlicher Rusher ('Jack') zur Stärke.",
    dbSlots: ["CB1", "CB2", "FS", "SS"],
    players: [
      { id: "LE", position: "DE", technique: "5", offset: { dx: -6, y: 0.7 } },
      { id: "DT1", position: "DT", technique: "1", offset: { dx: -1.5, y: 0.5 } },
      { id: "DT2", position: "DT", technique: "3", offset: { dx: 2.5, y: 0.5 } },
      { id: "JACK", position: "DE", technique: "7", offset: { dx: 6.5, y: 1 } },
      { id: "WLB", position: "OLB", offset: { dx: -7, y: 4 } },
      { id: "MLB", position: "MLB", offset: { dx: -1, y: 4.5 } },
      { id: "SLB", position: "OLB", offset: { dx: 6, y: 3.5 } },
    ],
  },
  {
    name: "3-4 Odd",
    personnel: "3-4",
    description: "Drei-Mann-Front mit Nose auf dem Center, zwei Stand-up-Edges als Rusher/Dropper.",
    dbSlots: ["CB1", "CB2", "FS", "SS"],
    players: [
      { id: "NT", position: "NT", technique: "0", offset: { dx: 0, y: 0.5 } },
      { id: "DE1", position: "DE", technique: "5", offset: { dx: -4, y: 0.7 } },
      { id: "DE2", position: "DE", technique: "5", offset: { dx: 4, y: 0.7 } },
      { id: "OLB1", position: "OLB", offset: { dx: -7, y: 1.5 } },
      { id: "ILB1", position: "ILB", offset: { dx: -1.5, y: 4.5 } },
      { id: "ILB2", position: "ILB", offset: { dx: 1.5, y: 4.5 } },
      { id: "OLB2", position: "OLB", offset: { dx: 7, y: 1.5 } },
    ],
  },
  {
    name: "Tite (4i-0-4i)",
    personnel: "4-2-5-artig",
    description: "Moderne Front gegen Gun-Spread: Nose auf dem Center, zwei 4i-Tackles schließen die B-Gaps, Edges stehen auf.",
    dbSlots: ["CB1", "CB2", "FS", "SS"],
    players: [
      { id: "NT", position: "NT", technique: "0", offset: { dx: 0, y: 0.5 } },
      { id: "DT1", position: "DT", technique: "4i", offset: { dx: -3, y: 0.6 } },
      { id: "DT2", position: "DT", technique: "4i", offset: { dx: 3, y: 0.6 } },
      { id: "EDGE1", position: "OLB", offset: { dx: -7, y: 1.3 } },
      { id: "EDGE2", position: "OLB", offset: { dx: 7, y: 1.3 } },
      { id: "ILB1", position: "ILB", offset: { dx: -1.5, y: 4.5 } },
      { id: "ILB2", position: "ILB", offset: { dx: 1.5, y: 4.5 } },
    ],
  },
  {
    name: "Mint",
    personnel: "4-2-5-artig",
    description: "Tite-Variante ohne echten Nose: zwei 4i-Tackles plus gemugste Backer in den A-Gaps, gute Pass-Rush-Flexibilität.",
    dbSlots: ["CB1", "CB2", "FS", "SS", "NB"],
    players: [
      { id: "DT1", position: "DT", technique: "4i", offset: { dx: -3, y: 0.6 } },
      { id: "DT2", position: "DT", technique: "4i", offset: { dx: 3, y: 0.6 } },
      { id: "EDGE1", position: "OLB", offset: { dx: -7, y: 1.3 } },
      { id: "EDGE2", position: "OLB", offset: { dx: 7, y: 1.3 } },
      { id: "MLB1", position: "MLB", technique: "A-Gap", offset: { dx: -1, y: 3.5 } },
      { id: "MLB2", position: "MLB", technique: "A-Gap", offset: { dx: 1, y: 3.5 } },
    ],
  },
  {
    name: "Bear",
    personnel: "46-artig",
    description: "Schwere Front: beide Guards und der Center sind von je einem DL abgedeckt. Starker Run-Stop, wenig Coverage-Personal.",
    dbSlots: ["CB1", "CB2", "SS"],
    players: [
      { id: "NT", position: "NT", technique: "0", offset: { dx: 0, y: 0.5 } },
      { id: "DT1", position: "DT", technique: "3", offset: { dx: -2.5, y: 0.5 } },
      { id: "DT2", position: "DT", technique: "3", offset: { dx: 2.5, y: 0.5 } },
      { id: "DE1", position: "DE", technique: "5", offset: { dx: -6, y: 0.7 } },
      { id: "DE2", position: "DE", technique: "5", offset: { dx: 6, y: 0.7 } },
      { id: "MLB", position: "MLB", offset: { dx: 0, y: 4.5 } },
      { id: "OLB1", position: "OLB", offset: { dx: -7, y: 3.5 } },
      { id: "OLB2", position: "OLB", offset: { dx: 7, y: 3.5 } },
    ],
  },
  {
    name: "Nickel 4-2-5",
    personnel: "4-2-5",
    description: "Vier-Mann-Front mit nur zwei Linebackern, fünfter Secondary-Spieler (Nickel) für mehr Coverage-Personal.",
    dbSlots: ["CB1", "CB2", "FS", "SS", "NB"],
    players: [
      { id: "DE1", position: "DE", technique: "5", offset: { dx: -5, y: 0.7 } },
      { id: "DT1", position: "DT", technique: "3", offset: { dx: -1.5, y: 0.5 } },
      { id: "DT2", position: "DT", technique: "1", offset: { dx: 1.5, y: 0.5 } },
      { id: "DE2", position: "DE", technique: "5", offset: { dx: 5, y: 0.7 } },
      { id: "WLB", position: "OLB", offset: { dx: -3, y: 4 } },
      { id: "MLB", position: "MLB", offset: { dx: 3, y: 4 } },
    ],
  },
  {
    name: "3-3-5 Stack",
    personnel: "3-3-5",
    description: "Drei-Mann-Front, drei Linebacker hinter den Linemen gestapelt, fünf Secondary-Spieler. Sehr flexibel für Blitz/Disguise.",
    dbSlots: ["CB1", "CB2", "FS", "SS", "NB"],
    players: [
      { id: "NT", position: "NT", technique: "0", offset: { dx: 0, y: 0.5 } },
      { id: "DE1", position: "DE", technique: "5", offset: { dx: -4, y: 0.7 } },
      { id: "DE2", position: "DE", technique: "5", offset: { dx: 4, y: 0.7 } },
      { id: "LB1", position: "OLB", offset: { dx: -3, y: 3.5 } },
      { id: "LB2", position: "MLB", offset: { dx: 0, y: 4.5 } },
      { id: "LB3", position: "OLB", offset: { dx: 3, y: 3.5 } },
    ],
  },
  {
    name: "Dime",
    personnel: "4-1-6",
    description: "Nur ein Linebacker, sechs Secondary-Spieler. Reines Passs-Down-Personal.",
    dbSlots: ["CB1", "CB2", "FS", "SS", "NB", "DB6"],
    players: [
      { id: "DE1", position: "DE", technique: "5", offset: { dx: -5, y: 0.7 } },
      { id: "DT1", position: "DT", technique: "3", offset: { dx: -1.5, y: 0.5 } },
      { id: "DT2", position: "DT", technique: "1", offset: { dx: 1.5, y: 0.5 } },
      { id: "DE2", position: "DE", technique: "5", offset: { dx: 5, y: 0.7 } },
      { id: "MLB", position: "MLB", offset: { dx: 0, y: 4 } },
    ],
  },
  {
    name: "Goal Line",
    personnel: "6-2",
    description: "Sehr schwere Front mit sechs Linemen für die Red Zone/Short Yardage, minimales Coverage-Personal.",
    dbSlots: ["CB1", "CB2", "SS"],
    players: [
      { id: "DE1", position: "DE", offset: { dx: -5, y: 0.5 } },
      { id: "DT1", position: "DT", offset: { dx: -3, y: 0.5 } },
      { id: "DT2", position: "DT", offset: { dx: -1, y: 0.5 } },
      { id: "DT3", position: "DT", offset: { dx: 1, y: 0.5 } },
      { id: "DT4", position: "DT", offset: { dx: 3, y: 0.5 } },
      { id: "DE2", position: "DE", offset: { dx: 5, y: 0.5 } },
      { id: "LB1", position: "MLB", offset: { dx: -1.5, y: 3 } },
      { id: "LB2", position: "MLB", offset: { dx: 1.5, y: 3 } },
    ],
  },
];

export function findFront(name: string): Front | undefined {
  return FRONTS.find((front) => front.name === name);
}
