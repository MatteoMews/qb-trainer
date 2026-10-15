import { describe, expect, it } from "vitest";
import type { Snap } from "../data/db";
import { analyzeBySituation, blitzRate, coverageDistribution, hashDistribution, matchesSituation, suggestBeaters } from "./scoutingAnalysis";

function makeSnap(overrides: Partial<Snap>): Snap {
  return {
    id: Math.random(),
    opponentId: 1,
    down: 1,
    distance: 10,
    fieldPosition: 50,
    hash: "middle",
    defenseFront: "4-3 Over",
    coverage: "Cover 3 Sky",
    blitz: false,
    result: "incomplete",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("matchesSituation", () => {
  it("classifies 3rd & long and 3rd & short correctly", () => {
    expect(matchesSituation(makeSnap({ down: 3, distance: 8 }), "3rd-long")).toBe(true);
    expect(matchesSituation(makeSnap({ down: 3, distance: 8 }), "3rd-short")).toBe(false);
    expect(matchesSituation(makeSnap({ down: 3, distance: 2 }), "3rd-short")).toBe(true);
    expect(matchesSituation(makeSnap({ down: 3, distance: 5 }), "3rd-long")).toBe(false);
    expect(matchesSituation(makeSnap({ down: 3, distance: 5 }), "3rd-short")).toBe(false);
  });

  it("classifies red zone by field position", () => {
    expect(matchesSituation(makeSnap({ fieldPosition: 85 }), "red-zone")).toBe(true);
    expect(matchesSituation(makeSnap({ fieldPosition: 50 }), "red-zone")).toBe(false);
  });

  it("'all' always matches", () => {
    expect(matchesSituation(makeSnap({}), "all")).toBe(true);
  });
});

describe("coverageDistribution / hashDistribution", () => {
  it("computes counts and percentages that sum to 1", () => {
    const snaps = [
      makeSnap({ coverage: "Cover 3 Sky" }),
      makeSnap({ coverage: "Cover 3 Sky" }),
      makeSnap({ coverage: "Cover 0" }),
    ];
    const dist = coverageDistribution(snaps);
    expect(dist[0]).toEqual({ key: "Cover 3 Sky", count: 2, pct: 2 / 3 });
    expect(dist.reduce((sum, d) => sum + d.pct, 0)).toBeCloseTo(1);
  });

  it("buckets by hash", () => {
    const snaps = [makeSnap({ hash: "left" }), makeSnap({ hash: "left" }), makeSnap({ hash: "right" })];
    const dist = hashDistribution(snaps);
    expect(dist[0].key).toBe("left");
    expect(dist[0].count).toBe(2);
  });
});

describe("blitzRate", () => {
  it("computes the fraction of blitzed snaps", () => {
    const snaps = [makeSnap({ blitz: true }), makeSnap({ blitz: false }), makeSnap({ blitz: false }), makeSnap({ blitz: false })];
    expect(blitzRate(snaps)).toBeCloseTo(0.25);
  });

  it("returns 0 for an empty list", () => {
    expect(blitzRate([])).toBe(0);
  });
});

describe("analyzeBySituation", () => {
  it("returns a report for every defined situation", () => {
    const reports = analyzeBySituation([makeSnap({})]);
    expect(reports.map((r) => r.situation)).toEqual(["all", "1st-down", "3rd-long", "3rd-short", "red-zone"]);
  });
});

describe("suggestBeaters", () => {
  it("suggests beater concepts once a coverage clearly dominates a situation", () => {
    const snaps = [
      makeSnap({ down: 3, distance: 8, coverage: "Cover 3 Buzz" }),
      makeSnap({ down: 3, distance: 9, coverage: "Cover 3 Buzz" }),
      makeSnap({ down: 3, distance: 10, coverage: "Cover 3 Buzz" }),
      makeSnap({ down: 3, distance: 7, coverage: "Cover 0" }),
    ];
    const suggestions = suggestBeaters(snaps);
    const longSuggestion = suggestions.find((s) => s.situation === "3rd-long");

    expect(longSuggestion).toBeDefined();
    expect(longSuggestion!.coverageName).toBe("Cover 3 Buzz");
    expect(longSuggestion!.concepts).toContain("Stick");
  });

  it("stays quiet when there isn't enough data yet", () => {
    const suggestions = suggestBeaters([makeSnap({ down: 3, distance: 8 })]);
    expect(suggestions.find((s) => s.situation === "3rd-long")).toBeUndefined();
  });
});
