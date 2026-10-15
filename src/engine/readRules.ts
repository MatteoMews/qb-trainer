import type { Concept, KeyDefenderRole } from "../data/concepts";
import type { Coverage } from "../data/coverages";
import type { Front } from "../data/fronts";
import { findRoute, type BreakDirection } from "../data/routeTree";
import type { Point } from "../data/schemas";
import type { DROPBACK_TYPES } from "../data/playSchema";
import { applyConcept, type AppliedAssignment } from "./applyConcept";
import { placeDefense, type PlacedDefender } from "./placeDefense";
import type { Formation } from "../data/formations";
import type { Hash } from "../data/field";

/**
 * Regelwerk-Engine für Phase 5: erzeugt Erklärungen aus den Daten von concepts.ts/coverages.ts,
 * statt 24×16-Kombinationen von Hand zu hinterlegen (siehe Projektauftrag 5.5: "Fehlt eine
 * Kombination, sagt die App das ehrlich, statt etwas zu erfinden"). Wo sich aus den Daten
 * nichts Sinnvolles ableiten lässt, wird das offen so benannt (siehe `ResolvedKeyDefender`
 * source: "unresolved" und `MatchupRating` tier: "none").
 */

type Dropback = (typeof DROPBACK_TYPES)[number];

const ROLE_KEYWORDS: Record<KeyDefenderRole, string[]> = {
  flat: ["flat"],
  hook: ["hook", "robber", "hole", "rat", "curl"],
  seam: ["seam"],
  "deep-middle": ["deep middle", "mitte", "free"],
  corner: [],
  "man-match": [],
};

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export interface ResolvedKeyDefender {
  id: string;
  label: string;
  source: "zone-label" | "position" | "man-match" | "unresolved";
}

/** Löst die generische `keyDefenderRole` eines Konzepts zu einem konkreten Verteidiger dieser
 *  Coverage auf: erst über Zonen-Label-Schlüsselwörter, dann über Positions-Konventionen,
 *  zuletzt (Man-Coverage) über den Verteidiger, der dem Progression-1-Receiver am nächsten steht. */
export function resolveKeyDefender(
  role: KeyDefenderRole,
  coverage: Coverage,
  availableDbIds: ReadonlySet<string>,
  placedDefenders: readonly PlacedDefender[],
  primaryReceiver: Point | undefined,
): ResolvedKeyDefender {
  const keywords = ROLE_KEYWORDS[role];
  if (keywords.length > 0) {
    const match = coverage.zones.find(
      (zone) => availableDbIds.has(zone.role) && keywords.some((keyword) => zone.label.toLowerCase().includes(keyword)),
    );
    if (match) return { id: match.role, label: match.label, source: "zone-label" };
  }

  if (role === "corner") {
    const cb = coverage.players.find((p) => availableDbIds.has(p.id) && p.position === "CB");
    if (cb) return { id: cb.id, label: `${cb.id} (Corner-Technik/-Tiefe)`, source: "position" };
  }
  if (role === "deep-middle") {
    const fs = coverage.players.find((p) => availableDbIds.has(p.id) && p.id === "FS");
    if (fs) return { id: fs.id, label: "Free Safety / Deep-Middle-Defender", source: "position" };
  }

  if (primaryReceiver) {
    const candidates = placedDefenders.filter((d) => availableDbIds.has(d.id) && d.group === "secondary");
    if (candidates.length > 0) {
      const nearest = candidates.reduce((best, d) => (distance(d.start, primaryReceiver) < distance(best.start, primaryReceiver) ? d : best));
      return { id: nearest.id, label: `${nearest.id} (nächster Verteidiger zum Primary-Receiver)`, source: "man-match" };
    }
  }

  return { id: "", label: "", source: "unresolved" };
}

export interface ProgressionStep {
  progression: number;
  role: string;
  routeName: string;
  routeDescription: string;
  readRule: string;
}

function stepReadRule(direction: BreakDirection): string {
  switch (direction) {
    case "ball":
      return "Bricht zur Mitte – offen, wenn der zuständige Verteidiger breit/außen bleibt.";
    case "sideline":
      return "Bricht zur Seitenlinie – offen, wenn der zuständige Verteidiger zur Mitte reagiert.";
    case "upfield-ball":
      return "Diagonaler Break zur Mitte/tief – offen gegen einseitige oder fehlende Deep-Help.";
    case "upfield-sideline":
      return "Diagonaler Break zur Seitenlinie/tief – offen, wenn die Außenhilfe nicht durchrotiert.";
    case "none":
      return "Läuft vertikal durch – offen, wenn keine zweite Ebene/Deep-Help dahintersteht.";
    case "varies":
      return "Read-Route – der Receiver passt den Break selbst an das Leverage des Verteidigers an.";
  }
}

/** Erzeugt die (zugewiesene, sortierte) Progression eines Konzepts mit generischen, aus den
 *  Routendaten abgeleiteten Lese-Regeln pro Schritt. */
export function generateProgression(concept: Concept, formation: Formation, hash: Hash): ProgressionStep[] {
  const applied = applyConcept(concept, formation, hash);
  return applied
    .filter((a): a is AppliedAssignment & { task: { type: "route"; route: Parameters<typeof findRoute>[0]; progression?: number } } =>
      a.task.type === "route",
    )
    .map((a) => {
      const route = findRoute(a.task.route);
      return {
        progression: a.task.progression ?? 0,
        role: a.id,
        routeName: route.name,
        routeDescription: route.description,
        readRule: stepReadRule(route.breaksToward),
      };
    })
    .sort((a, b) => a.progression - b.progression);
}

const DEPTH_TO_DROPBACK: readonly [number, Dropback][] = [
  [6, "quick"],
  [10, "3-step"],
  [16, "5-step"],
  [Infinity, "7-step"],
];

/** Leitet eine plausible Drop-Tiefe aus der Tiefe des Progression-1-Reads ab, statt sie pro
 *  Konzept erneut zu pflegen. */
export function deriveRecommendedDropback(concept: Concept): Dropback {
  const primary = [...concept.assignments].find((a) => a.task.type === "route" && a.task.progression === 1);
  if (!primary || primary.task.type !== "route") return "5-step";
  const depth = findRoute(primary.task.route).defaultDepthYd;
  return DEPTH_TO_DROPBACK.find(([maxDepth]) => depth <= maxDepth)?.[1] ?? "5-step";
}

export interface HotRoute {
  role: string;
  routeName: string;
}

/** Der Hot-Read gegen Blitz ist die flachste Route im Konzept (schnellster Timing-Punkt) -
 *  abgeleitet statt pro Konzept neu hinterlegt. */
export function deriveHotRoute(concept: Concept): HotRoute | null {
  const routeAssignments = concept.assignments.filter((a) => a.task.type === "route") as Array<{
    role: string;
    task: { type: "route"; route: Parameters<typeof findRoute>[0] };
  }>;
  if (routeAssignments.length === 0) return null;
  const shallowest = routeAssignments.reduce((best, a) =>
    findRoute(a.task.route).defaultDepthYd < findRoute(best.task.route).defaultDepthYd ? a : best,
  );
  return { role: shallowest.role, routeName: findRoute(shallowest.task.route).name };
}

export interface MatchupRating {
  stars: number;
  tier: "explicit" | "heuristic";
  reasons: string[];
}

/** Bewertet ein Konzept gegen eine Coverage: Tier "explicit", wenn die Coverage das Konzept
 *  selbst als Beater führt (coverages.ts); sonst ein transparent nachvollziehbarer Tag-basierter
 *  Heuristik-Score. Keine der 384 Kombinationen wird einzeln erfunden. */
export function rateMatchup(concept: Concept, coverage: Coverage): MatchupRating {
  const reasons: string[] = [];
  let stars = 2;
  let tier: MatchupRating["tier"] = "heuristic";

  if (coverage.beaterConcepts.includes(concept.name)) {
    stars = 5;
    tier = "explicit";
    reasons.push(`"${coverage.name}" führt "${concept.name}" explizit als Beater-Konzept (siehe Schwächen: ${coverage.weaknesses.join(", ")}).`);
    return { stars, tier, reasons };
  }

  if (concept.tags.includes("man-beater") && coverage.coverageType === "man") {
    stars += 1;
    reasons.push("Konzept ist als Man-Beater getaggt, Coverage spielt reine Man-Coverage.");
  }
  if (concept.tags.includes("zone-beater") && coverage.coverageType !== "man") {
    stars += 1;
    reasons.push("Konzept ist als Zone-Beater getaggt, Coverage spielt Zone/Pattern-Match.");
  }
  if (concept.tags.includes("explosive") && coverage.shell === "no-high") {
    stars += 1;
    reasons.push("Konzept zielt auf große Plays, Coverage hat pre-snap keine Deep-Help (No-High-Shell).");
  }
  if (concept.tags.includes("screen") && coverage.coverageType === "man") {
    stars += 1;
    reasons.push("Screens profitieren oft von aggressivem Man-Rush, der an der Line vorbeizieht.");
  }

  if (reasons.length === 0) {
    reasons.push("Keine spezifische Bewertung für diese Kombination hinterlegt – generische Einschätzung ohne besonderen Vorteil.");
  }

  return { stars: Math.min(5, Math.max(1, stars)), tier, reasons };
}

export interface PreSnapRead {
  label: string;
  detail: string;
}

const SHELL_TEXT: Record<Coverage["shell"], string> = {
  "no-high": "Kein tiefer Safety erkennbar (0-High) – höchste Explosiv-Gefahr, aber auch Pressure-Indikator.",
  "single-high": "Ein tiefer Safety mittig (MOFC – Middle of Field Closed).",
  "two-high": "Zwei tiefe Safeties (MOFO – Middle of Field Open).",
  quarters: "Vier Deep-Defender angedeutet, meist zwei Safeties tief (MOFO-artig, Quarters-Technik).",
  bracket: "Variable Shell, oft ein Safety zusätzlich über einem bestimmten Receiver geshiftet.",
};

/** Generiert die Pre-Snap-Erkennungsmerkmale aus Shell/Spieler-Tiefen/Front-Boxcount/Pressure -
 *  keine pro Coverage neu getexteten Inhalte. */
export function generatePreSnapRead(coverage: Coverage, front: Front | undefined, pressureName: string | undefined): PreSnapRead[] {
  const reads: PreSnapRead[] = [
    { label: "Safety-Shell", detail: SHELL_TEXT[coverage.shell] },
  ];

  const corner = coverage.players.find((p) => p.position === "CB");
  if (corner) {
    const depth = corner.offset.y;
    const detail =
      depth <= 2
        ? "Corners pressen eng an der Line – Indikator für Man oder Press-Zone."
        : depth <= 6
          ? "Corners in moderatem Off-Cushion – klassischer Zone-Indikator."
          : "Corners tief/weit weg pre-snap – typische Deep-Third-/Quarters-Technik.";
    reads.push({ label: "Corner-Tiefe/Leverage", detail });
  }

  if (front) {
    reads.push({ label: "Box-Count", detail: `${front.players.length} Mann in der Box (${front.name}).` });
  }

  reads.push({
    label: "Blitz-Indikatoren",
    detail: pressureName ? `Pressure angesagt: ${pressureName}.` : "Keine Pressure hinterlegt – Standard-Rush zu erwarten.",
  });

  return reads;
}

export interface ReadExplanation {
  keyDefender: ResolvedKeyDefender;
  progression: ProgressionStep[];
  dropback: Dropback;
  hotRoute: HotRoute | null;
  rating: MatchupRating;
  preSnap: PreSnapRead[];
}

/** Bündelt die gesamte Erklärung für eine Konzept × Coverage-Kombination (optional mit Front
 *  für Box-Count und Pressure-Hinweis). */
export function generateReadExplanation(
  concept: Concept,
  coverage: Coverage,
  formation: Formation,
  hash: Hash,
  front?: Front,
  pressureName?: string,
): ReadExplanation {
  const progression = generateProgression(concept, formation, hash);
  const appliedOffense = applyConcept(concept, formation, hash);
  const primary = appliedOffense.find((a) => a.task.type === "route" && a.task.progression === 1) ?? appliedOffense[0];

  const availableDbIds = new Set(front ? front.dbSlots : coverage.players.map((p) => p.id));
  const placedDefenders = front ? placeDefense(front, coverage, hash) : [];

  const keyDefender = resolveKeyDefender(concept.keyDefenderRole, coverage, availableDbIds, placedDefenders, primary?.start);

  return {
    keyDefender,
    progression,
    dropback: deriveRecommendedDropback(concept),
    hotRoute: deriveHotRoute(concept),
    rating: rateMatchup(concept, coverage),
    preSnap: generatePreSnapRead(coverage, front, pressureName),
  };
}
