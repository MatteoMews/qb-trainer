import { findCoverage } from "../data/coverages";
import type { Snap } from "../data/db";

/**
 * Auswertung erfasster Snaps (Projektauftrag 5.7): Coverage-Verteilung gesamt und nach
 * Situation, Blitz-Rate, und daraus abgeleitete Beater-Vorschläge (über coverage.beaterConcepts
 * aus coverages.ts - keine eigene, zweite Liste von "was schlägt was").
 */

export type Situation = "all" | "1st-down" | "3rd-long" | "3rd-short" | "red-zone";

export const SITUATION_LABELS: Record<Situation, string> = {
  all: "Alle Snaps",
  "1st-down": "1st Down",
  "3rd-long": "3rd & Long (7+)",
  "3rd-short": "3rd & Short (≤3)",
  "red-zone": "Red Zone (≤20 yd zur Goalline)",
};

const RED_ZONE_YARD_LINE = 80;
const THIRD_LONG_DISTANCE = 7;
const THIRD_SHORT_DISTANCE = 3;

export function matchesSituation(snap: Snap, situation: Situation): boolean {
  switch (situation) {
    case "all":
      return true;
    case "1st-down":
      return snap.down === 1;
    case "3rd-long":
      return snap.down === 3 && snap.distance >= THIRD_LONG_DISTANCE;
    case "3rd-short":
      return snap.down === 3 && snap.distance <= THIRD_SHORT_DISTANCE;
    case "red-zone":
      return snap.fieldPosition >= RED_ZONE_YARD_LINE;
  }
}

export interface DistributionEntry {
  key: string;
  count: number;
  pct: number;
}

function distribution(snaps: readonly Snap[], keyOf: (snap: Snap) => string): DistributionEntry[] {
  const counts = new Map<string, number>();
  for (const snap of snaps) {
    const key = keyOf(snap);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const total = snaps.length;
  return Array.from(counts.entries())
    .map(([key, count]) => ({ key, count, pct: total > 0 ? count / total : 0 }))
    .sort((a, b) => b.count - a.count);
}

export function coverageDistribution(snaps: readonly Snap[]): DistributionEntry[] {
  return distribution(snaps, (s) => s.coverage);
}

export function frontDistribution(snaps: readonly Snap[]): DistributionEntry[] {
  return distribution(snaps, (s) => s.defenseFront);
}

export function blitzRate(snaps: readonly Snap[]): number {
  if (snaps.length === 0) return 0;
  return snaps.filter((s) => s.blitz).length / snaps.length;
}

/** Verteilung nach Hash (links/mitte/rechts). Da sich Field/Boundary aus der Hash-Position
 *  ergibt (siehe Projektauftrag 4), zeigt das indirekt Field-/Boundary-Tendenzen des Gegners,
 *  z.B. spielt er auf dem Boundary-Hash andere Coverages als auf dem Field-Hash. */
export function hashDistribution(snaps: readonly Snap[]): DistributionEntry[] {
  return distribution(snaps, (s) => s.hash);
}

export interface SituationReport {
  situation: Situation;
  snapCount: number;
  coverages: DistributionEntry[];
  blitzRate: number;
}

export function analyzeBySituation(snaps: readonly Snap[]): SituationReport[] {
  return (Object.keys(SITUATION_LABELS) as Situation[]).map((situation) => {
    const matching = snaps.filter((s) => matchesSituation(s, situation));
    return {
      situation,
      snapCount: matching.length,
      coverages: coverageDistribution(matching),
      blitzRate: blitzRate(matching),
    };
  });
}

export interface BeaterSuggestion {
  situation: Situation;
  coverageName: string;
  coveragePct: number;
  concepts: readonly string[];
}

const MIN_SNAPS_FOR_SUGGESTION = 3;
const MIN_SHARE_FOR_SUGGESTION = 0.3;

/** Leitet pro Situation einen Vorschlag aus der häufigsten Coverage ab, z.B. "3rd & Long: 62%
 *  Cover 3 Match -> Flood/Sail, Dagger". Nutzt ausschließlich coverage.beaterConcepts
 *  (coverages.ts) - keine neu erfundenen Empfehlungen. */
export function suggestBeaters(snaps: readonly Snap[]): BeaterSuggestion[] {
  const reports = analyzeBySituation(snaps).filter((r) => r.situation !== "all" && r.snapCount >= MIN_SNAPS_FOR_SUGGESTION);
  const suggestions: BeaterSuggestion[] = [];

  for (const report of reports) {
    const top = report.coverages[0];
    if (!top || top.pct < MIN_SHARE_FOR_SUGGESTION) continue;
    const coverage = findCoverage(top.key);
    if (!coverage || coverage.beaterConcepts.length === 0) continue;
    suggestions.push({ situation: report.situation, coverageName: top.key, coveragePct: top.pct, concepts: coverage.beaterConcepts });
  }

  return suggestions;
}
