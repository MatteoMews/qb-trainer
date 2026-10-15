import type { RouteName } from "./routeTree";

/**
 * // TODO(Football-Check): Konzept-Beschreibungen, Rollen-Zuordnungen und vor allem die
 * // Progression (1-4) sind eine plausible Grundversion pro Konzept. In der Praxis hängt die
 * // tatsächliche Progression stark von der gezeigten Coverage ab (siehe Phase 5: Regelwerk
 * // Konzept × Coverage) und Namen/Varianten unterscheiden sich je nach Playbook/System
 * // (z.B. "China", "Yankee", "Spot" vs. "Snag"). Bitte prüfen.
 *
 * `role` referenziert ein Alignment-Label, wie es in formations.ts verwendet wird (X, Z, H, Y,
 * F, RB). Beim Anwenden eines Konzepts auf eine Formation werden nur Rollen zugewiesen, die in
 * der gewählten Formation auch vorhanden sind.
 */

export type ConceptPurpose =
  | "hi-lo"
  | "horizontal-stretch"
  | "vertical-stretch"
  | "man-beater"
  | "zone-beater"
  | "explosive"
  | "screen";

export interface ConceptAssignment {
  role: string;
  task: { type: "route"; route: RouteName; progression?: number } | { type: "block" };
}

export interface Concept {
  name: string;
  tags: readonly ConceptPurpose[];
  description: string;
  assignments: readonly ConceptAssignment[];
}

function route(role: string, route: RouteName, progression?: number): ConceptAssignment {
  return { role, task: { type: "route", route, progression } };
}

function block(role: string): ConceptAssignment {
  return { role, task: { type: "block" } };
}

export const CONCEPTS: readonly Concept[] = [
  {
    name: "Mesh",
    tags: ["man-beater", "zone-beater"],
    description:
      "Zwei flache Cross-Routes aus entgegengesetzten Seiten kreuzen sich knapp hinter der Line (Rub gegen Man), plus tiefere Dig- und Checkdown-Option.",
    assignments: [route("H", "Shallow", 1), route("Y", "Shallow", 2), route("Z", "Dig", 3), route("RB", "Swing", 4)],
  },
  {
    name: "Smash",
    tags: ["hi-lo"],
    description:
      "Hi-Lo auf den Corner: Außenreceiver läuft kurzen Hitch, Slot/TE dahinter einen Corner. Klassischer Cover-2-Beater.",
    assignments: [route("X", "Hitch", 1), route("H", "Corner", 2), route("Z", "Go", 3), route("RB", "Flat", 4)],
  },
  {
    name: "Flood/Sail",
    tags: ["horizontal-stretch", "vertical-stretch"],
    description:
      "Drei Ebenen zu einer Feldseite (tief/mittel/flach) fluten einen Flat-Defender horizontal und vertikal. Starker Cover-3-Beater.",
    assignments: [route("Y", "Out", 1), route("RB", "Flat", 2), route("X", "Slant", 3), route("Z", "Go", 4)],
  },
  {
    name: "Stick",
    tags: ["zone-beater", "man-beater"],
    description:
      "Slot/TE setzt sich im Zonenfenster ab (Stick), Flat darunter, Außenreceiver zieht als Clear-out leer. Quick-Game-Standard gegen Zone und Man.",
    assignments: [route("H", "Sit", 1), route("RB", "Flat", 2), route("Z", "Go", 3), route("X", "Slant", 4)],
  },
  {
    name: "Snag",
    tags: ["zone-beater"],
    description: "Dreiecks-Read (Snag/Corner/Flat), stellt einen Zonendefender hi-lo-hi. Guter Allround-Beater.",
    assignments: [route("X", "Hitch", 1), route("H", "Corner", 2), route("RB", "Flat", 3), route("Z", "Go", 4)],
  },
  {
    name: "Spot",
    tags: ["zone-beater"],
    description:
      "Eng verwandt mit Snag: Spot-Route (kurzer Pivot/Sitz), Flat und ein tieferer Corner bilden dasselbe Dreiecks-Prinzip.",
    assignments: [route("X", "Hitch", 1), route("RB", "Flat", 2), route("H", "Corner", 3), route("Z", "Go", 4)],
  },
  {
    name: "Y-Cross",
    tags: ["explosive", "man-beater"],
    description: "TE läuft eine tiefe Cross-Route als Hauptread, dazu flacher Drag und Clear-out-Go. Air-Raid-Klassiker.",
    assignments: [route("Y", "Dig", 1), route("H", "Shallow", 2), route("Z", "Go", 3), route("RB", "Swing", 4)],
  },
  {
    name: "Drive",
    tags: ["man-beater", "zone-beater"],
    description: "Flacher Drag unter einem tieferen Dig ('Levels'-artig gestaffelt), guter Beater gegen Man und Zone.",
    assignments: [route("H", "Shallow", 1), route("Y", "Dig", 2), route("Z", "Go", 3), route("RB", "Flat", 4)],
  },
  {
    name: "Shallow Cross",
    tags: ["man-beater"],
    description: "Primärer flacher Crosser mit tieferem Comeback auf der Backside als Ventil gegen Zone.",
    assignments: [route("H", "Shallow", 1), route("X", "Comeback", 2), route("Y", "Dig", 3), route("RB", "Flat", 4)],
  },
  {
    name: "Dagger",
    tags: ["explosive", "man-beater"],
    description: "Innen-Receiver räumt vertikal frei (Seam), Außenreceiver läuft darunter einen tiefen Dig als Hauptread.",
    assignments: [route("Z", "Dig", 1), route("X", "Slant", 2), route("H", "Seam", 3), route("Y", "Shallow", 4)],
  },
  {
    name: "Mills/Post-Dig",
    tags: ["man-beater", "zone-beater"],
    description: "Post räumt den Single-High-Safety, Dig darunter ist der Hauptread. Klassischer Cover-1/3-Beater.",
    assignments: [route("H", "Dig", 1), route("Z", "Post", 2), route("RB", "Flat", 3), route("X", "Go", 4)],
  },
  {
    name: "Levels",
    tags: ["zone-beater", "man-beater"],
    description: "Zwei In-Breaking-Routes auf unterschiedlichen Tiefen bilden eine Leiter gegen Linebacker/Zone.",
    assignments: [route("H", "Dig", 1), route("Y", "Dig", 2), route("Z", "Go", 3), route("RB", "Flat", 4)],
  },
  {
    name: "Four Verticals",
    tags: ["explosive", "vertical-stretch"],
    description: "Alle verfügbaren Receiver laufen vertikal (Seam/Go) und stressen die Deep-Zones; Read folgt der Safety-Rotation.",
    assignments: [route("H", "Seam", 1), route("Y", "Seam", 2), route("X", "Go", 3), route("Z", "Go", 4)],
  },
  {
    name: "Curl-Flat",
    tags: ["hi-lo", "zone-beater"],
    description: "Kern-Beater gegen Cover 2/3: Curl und Flat stellen den Flat-Defender hi-lo.",
    assignments: [route("X", "Curl", 1), route("RB", "Flat", 2), route("Z", "Curl", 3), route("Y", "Shallow", 4)],
  },
  {
    name: "Hitch/Seam",
    tags: ["zone-beater"],
    description: "Außen Hitch gegen Off-Coverage, Innen Seam gegen die Safety. Guter Quarters-Beater.",
    assignments: [route("X", "Hitch", 1), route("H", "Seam", 2), route("Z", "Hitch", 3), route("RB", "Swing", 4)],
  },
  {
    name: "Spacing",
    tags: ["zone-beater"],
    description: "Mehrere kurze Sit/Hitch-Routes gleichmäßig über die Feldbreite verteilt, überladen die Underneath-Zone zahlenmäßig.",
    assignments: [route("X", "Hitch", 1), route("F", "Sit", 2), route("H", "Sit", 3), route("Z", "Hitch", 4)],
  },
  {
    name: "Slant-Flat",
    tags: ["hi-lo", "man-beater"],
    description: "Quick-Game-Standard: Slant und Flat stellen einen Flat-/Curl-Defender hi-lo.",
    assignments: [route("X", "Slant", 1), route("RB", "Flat", 2), route("Z", "Slant", 3), route("Y", "Shallow", 4)],
  },
  {
    name: "Double Slants",
    tags: ["man-beater"],
    description: "Beide Außenreceiver laufen Slants zur Mitte, nutzen natürliche Rubs gegen Man-Coverage.",
    assignments: [route("X", "Slant", 1), route("Z", "Slant", 2), route("H", "Shallow", 3), route("RB", "Swing", 4)],
  },
  {
    name: "Bench/China",
    tags: ["hi-lo", "man-beater"],
    description:
      "Außen läuft Out zur Boundary ('Bench'), innen darunter ein flacher Pick-Release ('China'). Wirkt gegen Man wie ein natürlicher Rub, gegen Zone als Hi-Lo.",
    assignments: [route("X", "Out", 1), route("H", "Shallow", 2), route("Z", "Go", 3), route("RB", "Flat", 4)],
  },
  {
    name: "Yankee",
    tags: ["explosive"],
    description: "Zwei tiefe Routen kreuzen sich in der Mitte: ein tiefer Cross (Dig) und ein Corner von der Gegenseite.",
    assignments: [route("H", "Dig", 1), route("Z", "Corner", 2), route("X", "Go", 3), route("RB", "Flat", 4)],
  },
  {
    name: "Leak",
    tags: ["man-beater", "explosive"],
    description:
      "Play-Action-Konzept: ein Blocker/TE 'leakt' verzögert in den Flat, nachdem die Defense auf Run-Fits reagiert hat. Oft unbedeckt, wenn die Defense aggressiv anspielt.",
    assignments: [route("Z", "Post", 1), route("Y", "Flat", 2), route("X", "Dig", 3)],
  },
  {
    name: "Bubble Screen",
    tags: ["screen"],
    description: "Slot-Receiver bubbelt seitlich hinter die Line, Außenreceiver blockt den Corner. OL bleibt im Pass-Set.",
    assignments: [route("H", "Swing", 1), block("X")],
  },
  {
    name: "Tunnel Screen",
    tags: ["screen"],
    description: "Außenreceiver kommt nach kurzem Stem hinter der Line zurück zur Formation ('Tunnel'), OL released downfield als Führungsblocker.",
    assignments: [route("X", "Whip", 1), block("Y")],
  },
  {
    name: "Slip Screen",
    tags: ["screen"],
    description: "RB täuscht Pass-Protection an und slippt verzögert in den Flat, nachdem Rusher an ihm vorbeigezogen sind.",
    assignments: [route("RB", "Angle", 1)],
  },
];

export function findConcept(name: string): Concept | undefined {
  return CONCEPTS.find((concept) => concept.name === name);
}
