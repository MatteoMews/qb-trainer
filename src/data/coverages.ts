import type { Yards } from "./field";
import type { DefensePosition } from "./positions";

/**
 * // TODO(Football-Check): Alignment-Tiefen/-Breiten, Zonen-Landmarks und vor allem die
 * // Benennung einzelner Coverage-Varianten (z.B. Sky/Buzz/Cloud, Rat/Hole vs. Robber) sind in
 * // der Praxis nicht einheitlich und unterscheiden sich je nach Team/System. Bitte prüfen.
 *
 * `players` nutzt dieselben Rollen-IDs wie fronts.ts' dbSlots (CB1, CB2, FS, SS, NB, DB6) -
 * nur Rollen, die die gewählte Front auch vorsieht, werden tatsächlich platziert
 * (siehe engine/placeDefense.ts).
 */

export type CoverageShell = "no-high" | "single-high" | "two-high" | "quarters" | "bracket";

/** Steuert das Simulations-Verhalten (Phase 4): "man" = Verteidiger folgen einem Receiver,
 *  "zone" = Verteidiger droppen zu ihrem Landmark, "pattern-match" = startet wie Zone, matcht
 *  aber vertikale Releases (vereinfacht wie Zone simuliert, siehe engine/simulate.ts). */
export type CoverageType = "man" | "zone" | "pattern-match";

export interface CoveragePlayer {
  id: string;
  position: DefensePosition;
  offset: { dx: Yards; y: Yards };
}

export interface CoverageZone {
  role: string;
  label: string;
  landmark: string;
}

export interface Coverage {
  name: string;
  shell: CoverageShell;
  coverageType: CoverageType;
  description: string;
  zones: readonly CoverageZone[];
  strengths: readonly string[];
  weaknesses: readonly string[];
  /** Namen aus data/concepts.ts, die diese Coverage typischerweise gut schlagen. */
  beaterConcepts: readonly string[];
  players: readonly CoveragePlayer[];
}

export const COVERAGES: readonly Coverage[] = [
  {
    name: "Cover 0",
    shell: "no-high",
    coverageType: "man",
    description: "Reine Mann-Coverage ohne Deep-Safety-Hilfe. Maximaler Druck, keine Sicherheit gegen den großen Play.",
    zones: [],
    strengths: ["Maximaler Pass-Rush möglich", "Schwer zu lesen pre-snap", "Eng am Receiver"],
    weaknesses: ["Keine Hilfe gegen Go/Seam", "Ein Fehler im Man = Explosive Play"],
    beaterConcepts: ["Mesh", "Y-Cross", "Dagger", "Double Slants"],
    players: [
      { id: "CB1", position: "CB", offset: { dx: -22, y: 1 } },
      { id: "CB2", position: "CB", offset: { dx: 22, y: 1 } },
      { id: "FS", position: "S", offset: { dx: 0, y: 6 } },
      { id: "SS", position: "SS", offset: { dx: 9, y: 5 } },
      { id: "NB", position: "NB", offset: { dx: -10, y: 3 } },
    ],
  },
  {
    name: "Cover 1 Free",
    shell: "single-high",
    coverageType: "man",
    description: "Mann-Coverage mit einem freien Deep-Safety in der Mitte, sonst Man-to-Man ohne weitere Hilfe.",
    zones: [{ role: "FS", label: "Deep Middle (Free)", landmark: "Mittig, ~12-14 yd Tiefe" }],
    strengths: ["Hilfe über allen Receivern mittig", "Guter Blitz-Begleiter"],
    weaknesses: ["Seams zwischen Hash und Safety offen", "Vier-Vertical-Stress"],
    beaterConcepts: ["Four Verticals", "Mills/Post-Dig", "Y-Cross"],
    players: [
      { id: "CB1", position: "CB", offset: { dx: -22, y: 1 } },
      { id: "CB2", position: "CB", offset: { dx: 22, y: 1 } },
      { id: "FS", position: "S", offset: { dx: 0, y: 12 } },
      { id: "SS", position: "SS", offset: { dx: 9, y: 5 } },
      { id: "NB", position: "NB", offset: { dx: -10, y: 3 } },
    ],
  },
  {
    name: "Cover 1 Robber",
    shell: "single-high",
    coverageType: "man",
    description:
      "Wie Cover 1 Free, aber ein zusätzlicher Defender (oft SS) spielt als 'Robber' unterhalb und liest die Augen des QB, statt fest zu manen.",
    zones: [
      { role: "FS", label: "Deep Middle", landmark: "Mittig, ~12-14 yd Tiefe" },
      { role: "SS", label: "Robber", landmark: "Mittig, ~6 yd Tiefe, liest QB" },
    ],
    strengths: ["Stiehlt Slants/Digs durch die Mitte", "Verwirrt den QB-Read"],
    weaknesses: ["Ein Mann weniger im echten Man-Coverage", "Seams weiterhin offen"],
    beaterConcepts: ["Four Verticals", "Y-Cross", "Flood/Sail"],
    players: [
      { id: "CB1", position: "CB", offset: { dx: -22, y: 1 } },
      { id: "CB2", position: "CB", offset: { dx: 22, y: 1 } },
      { id: "FS", position: "S", offset: { dx: 0, y: 12 } },
      { id: "SS", position: "SS", offset: { dx: 0, y: 6 } },
      { id: "NB", position: "NB", offset: { dx: -10, y: 3 } },
    ],
  },
  {
    name: "Cover 1 Rat/Hole",
    shell: "single-high",
    coverageType: "man",
    description:
      "Wie Cover 1 Free, aber ein Linebacker ('Rat') spielt statt eines RB-Mans die mittlere Lücke (Hole) und unterstützt gegen Scramble-Drill/Check-downs.",
    zones: [
      { role: "FS", label: "Deep Middle", landmark: "Mittig, ~12-14 yd Tiefe" },
      { role: "MLB", label: "Hole/Rat", landmark: "Mittig, ~5 yd Tiefe, spied auf RB/Scramble" },
    ],
    strengths: ["Stoppt Scramble-Drill und Check-downs", "Zusätzliche Hilfe im Hole"],
    weaknesses: ["RB im Pass-Pro statt im Coverage ungedeckt", "Seams weiterhin offen"],
    beaterConcepts: ["Four Verticals", "Mills/Post-Dig"],
    players: [
      { id: "CB1", position: "CB", offset: { dx: -22, y: 1 } },
      { id: "CB2", position: "CB", offset: { dx: 22, y: 1 } },
      { id: "FS", position: "S", offset: { dx: 0, y: 12 } },
      { id: "SS", position: "SS", offset: { dx: 9, y: 5 } },
      { id: "NB", position: "NB", offset: { dx: -10, y: 3 } },
    ],
  },
  {
    name: "Cover 2 Zone",
    shell: "two-high",
    coverageType: "zone",
    description: "Zwei Deep-Safeties teilen sich die tiefe Hälfte, Corners spielen Flat-Zone, Linebacker die Hook/Curl-Zonen.",
    zones: [
      { role: "FS", label: "Deep Half (links)", landmark: "~10-12 yd Tiefe, halbe Feldbreite" },
      { role: "SS", label: "Deep Half (rechts)", landmark: "~10-12 yd Tiefe, halbe Feldbreite" },
      { role: "CB1", label: "Flat (links)", landmark: "~2-5 yd Tiefe, Außenbahn" },
      { role: "CB2", label: "Flat (rechts)", landmark: "~2-5 yd Tiefe, Außenbahn" },
    ],
    strengths: ["Zwei Mann über den tiefen Routen", "Guter Run-Support der Corners"],
    weaknesses: ["Deep Middle (Seam) zwischen den Safeties offen", "Hi-Lo auf die Flat-Defender"],
    beaterConcepts: ["Smash", "Curl-Flat", "Four Verticals"],
    players: [
      { id: "CB1", position: "CB", offset: { dx: -20, y: 2 } },
      { id: "CB2", position: "CB", offset: { dx: 20, y: 2 } },
      { id: "FS", position: "S", offset: { dx: -9, y: 10 } },
      { id: "SS", position: "SS", offset: { dx: 9, y: 10 } },
      { id: "NB", position: "NB", offset: { dx: -10, y: 3 } },
    ],
  },
  {
    name: "Tampa 2",
    shell: "two-high",
    coverageType: "zone",
    description: "Cover-2-Variante, bei der der Mike Linebacker die Deep-Middle-Lücke zwischen den Safeties zusätzlich absichert.",
    zones: [
      { role: "FS", label: "Deep Half (links)", landmark: "~12-14 yd Tiefe" },
      { role: "SS", label: "Deep Half (rechts)", landmark: "~12-14 yd Tiefe" },
      { role: "MLB", label: "Deep Middle Hole", landmark: "Mittig, ~15-18 yd Tiefe, sprintet aus der Mitte" },
    ],
    strengths: ["Schließt die klassische Cover-2-Seam-Schwäche", "Weiterhin starker Run-Support"],
    weaknesses: ["Abhängig von einem schnellen Mike-Linebacker", "Flat/Hi-Lo-Schwäche bleibt"],
    beaterConcepts: ["Smash", "Curl-Flat"],
    players: [
      { id: "CB1", position: "CB", offset: { dx: -20, y: 2 } },
      { id: "CB2", position: "CB", offset: { dx: 20, y: 2 } },
      { id: "FS", position: "S", offset: { dx: -9, y: 10 } },
      { id: "SS", position: "SS", offset: { dx: 9, y: 10 } },
      { id: "NB", position: "NB", offset: { dx: -10, y: 3 } },
    ],
  },
  {
    name: "2-Man",
    shell: "two-high",
    coverageType: "man",
    description: "Zwei Deep-Safeties wie Cover 2, aber alle Underneath-Defender spielen Mann-Coverage statt Zone.",
    zones: [
      { role: "FS", label: "Deep Half (links)", landmark: "~10-12 yd Tiefe" },
      { role: "SS", label: "Deep Half (rechts)", landmark: "~10-12 yd Tiefe" },
    ],
    strengths: ["Enge Coverage bei Deep-Hilfe", "Schwer für kurze Timing-Routen"],
    weaknesses: ["Picks/Rubs gegen Man", "Out-Routen in die Safety-Leverage"],
    beaterConcepts: ["Mesh", "Double Slants", "Bench/China"],
    players: [
      { id: "CB1", position: "CB", offset: { dx: -22, y: 1 } },
      { id: "CB2", position: "CB", offset: { dx: 22, y: 1 } },
      { id: "FS", position: "S", offset: { dx: -9, y: 10 } },
      { id: "SS", position: "SS", offset: { dx: 9, y: 10 } },
      { id: "NB", position: "NB", offset: { dx: -10, y: 3 } },
    ],
  },
  {
    name: "Cover 3 Sky",
    shell: "single-high",
    coverageType: "zone",
    description: "Deep-Third-Zone mit Safety-Rotation: die Strong Safety ('Sky') rotiert zum Flat/Force-Defender.",
    zones: [
      { role: "FS", label: "Deep Third (Mitte)", landmark: "Mittig, ~14 yd Tiefe" },
      { role: "CB1", label: "Deep Third (links)", landmark: "Außen, ~10 yd Tiefe" },
      { role: "CB2", label: "Deep Third (rechts)", landmark: "Außen, ~10 yd Tiefe" },
      { role: "SS", label: "Flat/Force (Sky-Rotation)", landmark: "~4 yd Tiefe, Außenbahn" },
    ],
    strengths: ["Starke Run-Fits durch Safety-Rotation", "Drei Mann über den tiefen Routen"],
    weaknesses: ["Deep Middle nur ein Mann", "Curl/Flat-Voids unter den Deep-Thirds"],
    beaterConcepts: ["Flood/Sail", "Curl-Flat", "Dagger"],
    players: [
      { id: "CB1", position: "CB", offset: { dx: -20, y: 10 } },
      { id: "CB2", position: "CB", offset: { dx: 20, y: 10 } },
      { id: "FS", position: "S", offset: { dx: 0, y: 14 } },
      { id: "SS", position: "SS", offset: { dx: 9, y: 4 } },
      { id: "NB", position: "NB", offset: { dx: -10, y: 3 } },
    ],
  },
  {
    name: "Cover 3 Buzz",
    shell: "single-high",
    coverageType: "zone",
    description: "Cover-3-Variante, bei der die schwache Safety ('Buzz') statt der starken zum Curl/Flat 'buzzt', während die starke Safety tief bleibt.",
    zones: [
      { role: "FS", label: "Deep Third (Mitte)", landmark: "Mittig, ~14 yd Tiefe" },
      { role: "CB1", label: "Deep Third (links)", landmark: "Außen, ~10 yd Tiefe" },
      { role: "CB2", label: "Deep Third (rechts)", landmark: "Außen, ~10 yd Tiefe" },
      { role: "SS", label: "Curl/Flat (Buzz-Rotation)", landmark: "~5 yd Tiefe, Hash-Bereich" },
    ],
    strengths: ["Verschleiert, welche Safety rotiert", "Guter Curl/Flat-Support zur schwachen Seite"],
    weaknesses: ["Deep Middle nur ein Mann", "Hi-Lo-Flood weiterhin möglich"],
    beaterConcepts: ["Flood/Sail", "Stick", "Dagger"],
    players: [
      { id: "CB1", position: "CB", offset: { dx: -20, y: 10 } },
      { id: "CB2", position: "CB", offset: { dx: 20, y: 10 } },
      { id: "FS", position: "S", offset: { dx: 0, y: 14 } },
      { id: "SS", position: "SS", offset: { dx: -9, y: 5 } },
      { id: "NB", position: "NB", offset: { dx: -10, y: 3 } },
    ],
  },
  {
    name: "Cover 3 Cloud",
    shell: "single-high",
    coverageType: "zone",
    description: "Cover-3-Variante mit Corner-Support: der Corner zur Call-Seite rollt als Flat/Force-Defender hoch, die Safety bleibt tief.",
    zones: [
      { role: "FS", label: "Deep Third (Mitte)", landmark: "Mittig, ~14 yd Tiefe" },
      { role: "CB1", label: "Deep Third (links)", landmark: "Außen, ~10 yd Tiefe" },
      { role: "CB2", label: "Flat/Force (Cloud-Rotation)", landmark: "~4 yd Tiefe, Außenbahn" },
      { role: "SS", label: "Deep Third (rechts, von der Safety übernommen)", landmark: "Außen, ~10 yd Tiefe" },
    ],
    strengths: ["Starker äußerer Run-Support ohne Safety-Rotation", "Corner näher am Receiver pre-snap"],
    weaknesses: ["Corner verliert Deep-Leverage bei Go-Routen", "Deep Middle nur ein Mann"],
    beaterConcepts: ["Smash", "Corner", "Flood/Sail"],
    players: [
      { id: "CB1", position: "CB", offset: { dx: -20, y: 10 } },
      { id: "CB2", position: "CB", offset: { dx: 18, y: 4 } },
      { id: "FS", position: "S", offset: { dx: 0, y: 14 } },
      { id: "SS", position: "SS", offset: { dx: 14, y: 10 } },
      { id: "NB", position: "NB", offset: { dx: -10, y: 3 } },
    ],
  },
  {
    name: "Cover 3 Match (Rip/Liz)",
    shell: "single-high",
    coverageType: "pattern-match",
    description:
      "Pattern-Match-Variante von Cover 3: Deep-Third-Defender matchen vertikale Releases der #2/#3-Receiver (Seam-Flat-Regeln), statt starr Zone zu droppen.",
    zones: [
      { role: "FS", label: "Deep Third (Mitte, matcht #2 vertikal)", landmark: "Mittig, ~14 yd Tiefe" },
      { role: "CB1", label: "Deep Third (links, matcht #1 vertikal)", landmark: "Außen, ~10 yd Tiefe" },
      { role: "CB2", label: "Deep Third (rechts, matcht #1 vertikal)", landmark: "Außen, ~10 yd Tiefe" },
      { role: "SS", label: "Seam-Flat (matcht #2, sonst Flat)", landmark: "~6 yd Tiefe, Hash-Bereich" },
    ],
    strengths: ["Spielt wie Man gegen vertikale Releases, wie Zone gegen kurz", "Schwer zu floaten"],
    weaknesses: ["Komplex, anfällig für Kommunikationsfehler", "Crossing-Routen zwischen den Thirds"],
    beaterConcepts: ["Mesh", "Shallow Cross", "Y-Cross"],
    players: [
      { id: "CB1", position: "CB", offset: { dx: -20, y: 10 } },
      { id: "CB2", position: "CB", offset: { dx: 20, y: 10 } },
      { id: "FS", position: "S", offset: { dx: 0, y: 14 } },
      { id: "SS", position: "SS", offset: { dx: 9, y: 6 } },
      { id: "NB", position: "NB", offset: { dx: -10, y: 3 } },
    ],
  },
  {
    name: "Cover 4 Match-Quarters",
    shell: "quarters",
    coverageType: "pattern-match",
    description: "Vier Deep-Defender teilen sich je ein Feldviertel und matchen die Releases der Receiver in ihrem Viertel.",
    zones: [
      { role: "CB1", label: "Quarter (links außen)", landmark: "Außen, ~10 yd Tiefe" },
      { role: "FS", label: "Quarter (links innen)", landmark: "Halb-Feld links, ~11 yd Tiefe" },
      { role: "SS", label: "Quarter (rechts innen)", landmark: "Halb-Feld rechts, ~11 yd Tiefe" },
      { role: "CB2", label: "Quarter (rechts außen)", landmark: "Außen, ~10 yd Tiefe" },
    ],
    strengths: ["Vier Mann über allem Tiefen", "Flexibel zwischen Run-Support und Coverage"],
    weaknesses: ["Anfangs weniger Run-Support als Single-High", "Kombi-Routen (Smash, Flood) testen die Regeln"],
    beaterConcepts: ["Four Verticals", "Mills/Post-Dig"],
    players: [
      { id: "CB1", position: "CB", offset: { dx: -20, y: 10 } },
      { id: "CB2", position: "CB", offset: { dx: 20, y: 10 } },
      { id: "FS", position: "S", offset: { dx: -9, y: 11 } },
      { id: "SS", position: "SS", offset: { dx: 9, y: 11 } },
      { id: "NB", position: "NB", offset: { dx: -10, y: 3 } },
    ],
  },
  {
    name: "Palms (2-Read)",
    shell: "quarters",
    coverageType: "pattern-match",
    description:
      "Quarters-Variante: Corner und Safety einer Seite 'lesen' den #2-Receiver - geht er raus, squattet der Corner auf den Out und die Safety übernimmt #1 vertikal.",
    zones: [
      { role: "CB1", label: "Read #2 (squattet auf Out/Smash)", landmark: "Außen, ~7 yd Tiefe" },
      { role: "FS", label: "Übernimmt #1 vertikal bei Out von #2", landmark: "Halb-Feld, ~11 yd Tiefe" },
      { role: "SS", label: "Quarter (rechts)", landmark: "Halb-Feld, ~11 yd Tiefe" },
      { role: "CB2", label: "Quarter (rechts außen)", landmark: "Außen, ~10 yd Tiefe" },
    ],
    strengths: ["Starker Smash-Beater (Out/Corner-Kombi)", "Guter Run-Support durch den Corner"],
    weaknesses: ["Doppelmoves des #2-Receivers", "Vertical-#2-Stress (Four Verticals)"],
    beaterConcepts: ["Four Verticals", "Dagger"],
    players: [
      { id: "CB1", position: "CB", offset: { dx: -20, y: 7 } },
      { id: "CB2", position: "CB", offset: { dx: 20, y: 10 } },
      { id: "FS", position: "S", offset: { dx: -9, y: 11 } },
      { id: "SS", position: "SS", offset: { dx: 9, y: 11 } },
      { id: "NB", position: "NB", offset: { dx: -10, y: 3 } },
    ],
  },
  {
    name: "Cover 7 (Bracket-Match)",
    shell: "quarters",
    coverageType: "pattern-match",
    description:
      "Sammelbegriff für Quarters-Spielarten mit individuellen Bracket-Regeln pro Receiver (z.B. 'Stubbie' gegen den Slot, 'Cutoff' gegen den Außenreceiver).",
    zones: [
      { role: "NB", label: "Stubbie (Match Slot innen/kurz)", landmark: "Slot-Bereich, ~5 yd Tiefe" },
      { role: "CB1", label: "Cutoff (Match Außen, verhindert Inside-Release)", landmark: "Außen, ~8 yd Tiefe" },
      { role: "FS", label: "Quarter/Bracket-Hilfe", landmark: "Halb-Feld, ~11 yd Tiefe" },
      { role: "SS", label: "Quarter/Bracket-Hilfe", landmark: "Halb-Feld, ~11 yd Tiefe" },
    ],
    strengths: ["Individuelle Bracket-Regeln pro Gegner-Receiver", "Sehr anpassbar gegen bestimmte Personnel"],
    weaknesses: ["Komplexe Kommunikation", "Schwächen, wenn Bracket-Regeln falsch gelesen werden"],
    beaterConcepts: ["Spacing", "Levels"],
    players: [
      { id: "CB1", position: "CB", offset: { dx: -20, y: 8 } },
      { id: "CB2", position: "CB", offset: { dx: 20, y: 10 } },
      { id: "FS", position: "S", offset: { dx: -9, y: 11 } },
      { id: "SS", position: "SS", offset: { dx: 9, y: 11 } },
      { id: "NB", position: "NB", offset: { dx: -10, y: 5 } },
    ],
  },
  {
    name: "Cover 6 (Quarter-Quarter-Half)",
    shell: "quarters",
    coverageType: "pattern-match",
    description: "Split-Field-Coverage: zur kurzen/Boundary-Seite Quarters, zur breiten/Field-Seite Cover-2-Half.",
    zones: [
      { role: "CB1", label: "Quarter (Boundary außen)", landmark: "Außen kurze Seite, ~10 yd Tiefe" },
      { role: "FS", label: "Quarter (Boundary innen)", landmark: "Kurze Seite, ~11 yd Tiefe" },
      { role: "SS", label: "Deep Half (Field)", landmark: "Breite Seite, ~12 yd Tiefe" },
      { role: "CB2", label: "Flat (Field)", landmark: "Breite Seite, ~4 yd Tiefe" },
    ],
    strengths: ["Passt Coverage-Stärke an Formation-Breite an", "Gut gegen Trips zur Field-Seite"],
    weaknesses: ["Unterschiedliche Regeln je Seite erhöhen Kommunikationsrisiko"],
    beaterConcepts: ["Flood/Sail", "Four Verticals"],
    players: [
      { id: "CB1", position: "CB", offset: { dx: -20, y: 10 } },
      { id: "CB2", position: "CB", offset: { dx: 20, y: 4 } },
      { id: "FS", position: "S", offset: { dx: -9, y: 11 } },
      { id: "SS", position: "SS", offset: { dx: 13, y: 12 } },
      { id: "NB", position: "NB", offset: { dx: -10, y: 3 } },
    ],
  },
  {
    name: "Bracket/Doppel-Coverage",
    shell: "bracket",
    coverageType: "man",
    description:
      "Zwei Defender doppeln den gefährlichsten Receiver (z.B. Corner unterhalb, Safety darüber), der Rest der Defense spielt eine Basis-Coverage (meist Cover 1).",
    zones: [
      { role: "CB1", label: "Bracket unten (vs. Top-Receiver)", landmark: "Direkt am Receiver, unterhalb" },
      { role: "FS", label: "Bracket oben (vs. Top-Receiver)", landmark: "Über dem Receiver, ~10 yd Tiefe" },
      { role: "SS", label: "Deep Middle (Rest-Coverage)", landmark: "Mittig, ~12 yd Tiefe" },
    ],
    strengths: ["Nimmt den gefährlichsten Receiver praktisch aus dem Spiel"],
    weaknesses: ["Zwei Defender auf einen Mann gebunden = weniger Hilfe anderswo"],
    beaterConcepts: ["Four Verticals", "Levels"],
    players: [
      { id: "CB1", position: "CB", offset: { dx: 20, y: 2 } },
      { id: "CB2", position: "CB", offset: { dx: -22, y: 1 } },
      { id: "FS", position: "S", offset: { dx: 20, y: 10 } },
      { id: "SS", position: "SS", offset: { dx: 0, y: 12 } },
      { id: "NB", position: "NB", offset: { dx: -10, y: 3 } },
    ],
  },
];

export function findCoverage(name: string): Coverage | undefined {
  return COVERAGES.find((coverage) => coverage.name === name);
}
