/**
 * // TODO(Football-Check): Pressure-Beschreibungen sind allgemeingültig gehalten; die exakte
 * // Zuordnung, welcher Spieler in welchem Blitz rusht/dropt, hängt von der konkreten Front und
 * // Coverage-Kombination ab und sollte je nach Spielzug geprüft werden.
 *
 * Pressures sind in Phase 3 reine Referenz-/Planungsdaten (wer rusht zusätzlich, wer droppt,
 * mit welcher Coverage dahinter gespielt wird). Die tatsächliche Rush-Simulation (Zeit bis zum
 * Druck) folgt in der Simulations-Engine (Phase 4).
 */

export interface Pressure {
  name: string;
  description: string;
  typicalCoverage: string;
  strengths: readonly string[];
  weaknesses: readonly string[];
}

export const PRESSURES: readonly Pressure[] = [
  {
    name: "Fire Zone (3-Under/3-Deep)",
    description:
      "Fünf Rusher, einer davon ein Linebacker/DB statt eines Linemen, der dafür droppt ('Exchange'). Dahinter 3 Deep-Zonen und 3 Underneath-Zonen.",
    typicalCoverage: "Cover 3 Match (Rip/Liz)",
    strengths: ["Zusätzlicher Rusher ohne Coverage-Mann zu verlieren", "Verwirrt Pass-Pro-Zuweisungen"],
    weaknesses: ["Nur 3 Deep-Defender bei vier verfügbaren Rushern", "Hot-Routes gegen den droppenden Lineman"],
  },
  {
    name: "Sim Pressure / Creeper",
    description:
      "Simuliert einen Blitz (zusätzlicher Rusher zeigt sich pre-snap), rusht aber nur mit vier Mann - ein anderer Spieler droppt überraschend in Coverage.",
    typicalCoverage: "Cover 3 Match (Rip/Liz)",
    strengths: ["Verwirrt die Pass-Pro-Identifikation", "Volle Coverage-Zahl trotz Blitz-Optik"],
    weaknesses: ["Weniger echter Druck als ein echter Blitz", "Abhängig von korrekter Disguise"],
  },
  {
    name: "Cover-0-Blitz",
    description: "Mindestens ein zusätzlicher Rusher bei reiner Mann-Coverage ohne Deep-Safety-Hilfe.",
    typicalCoverage: "Cover 0",
    strengths: ["Maximaler Druck", "Überzahl an der Line"],
    weaknesses: ["Keine Hilfe gegen den Big Play", "Hot-Routes/Sight-Adjusts sind Pflicht für die Offense"],
  },
  {
    name: "Cover-1-Blitz",
    description: "Zusätzlicher Rusher bei Mann-Coverage mit einem freien Deep-Safety als Absicherung.",
    typicalCoverage: "Cover 1 Free",
    strengths: ["Druck mit etwas Sicherheitsnetz in der Mitte"],
    weaknesses: ["Weiterhin Man-Coverage-Schwächen (Picks/Rubs)"],
  },
  {
    name: "Overload",
    description: "Mehr Rusher auf eine Seite der Line gestellt, als die Offense dort Blocker hat.",
    typicalCoverage: "Cover 1 Free",
    strengths: ["Erzwingt schnelle, falsche Blitz-Zuweisungen", "Oft unblockter Rusher"],
    weaknesses: ["Schwache Seite anfällig für schnelle Routen dorthin"],
  },
  {
    name: "Edge-Blitz",
    description: "Zusätzlicher Rusher von außen (Edge), oft ein Safety oder Corner, der von weit außen kommt.",
    typicalCoverage: "Cover 3 Sky",
    strengths: ["Schwer für den Tackle zu sehen/zu blocken", "Guter Winkel zum QB"],
    weaknesses: ["Weiter Weg = mehr Zeit für die Offense, ihn zu erkennen"],
  },
  {
    name: "A-Gap-Blitz",
    description: "Zusätzlicher Rusher(s) direkt neben dem Center durch die A-Gaps.",
    typicalCoverage: "Cover 1 Robber",
    strengths: ["Kürzester Weg zum QB", "Schwer sauber zu identifizieren pre-snap"],
    weaknesses: ["Center/Guards können bei korrekter Erkennung schnell reagieren"],
  },
];

export function findPressure(name: string): Pressure | undefined {
  return PRESSURES.find((pressure) => pressure.name === name);
}
