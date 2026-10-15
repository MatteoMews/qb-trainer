import { describe, expect, it } from "vitest";
import { findConcept } from "../data/concepts";
import { findCoverage } from "../data/coverages";
import { findFormation } from "../data/formations";
import { findFront } from "../data/fronts";
import {
  deriveHotRoute,
  deriveRecommendedDropback,
  generatePreSnapRead,
  generateProgression,
  generateReadExplanation,
  rateMatchup,
  resolveKeyDefender,
} from "./readRules";
import { placeDefense } from "./placeDefense";

const stick = findConcept("Stick")!;
const fourVerts = findConcept("Four Verticals")!;
const smash = findConcept("Smash")!;
const trips = findFormation("Trips Right (3x1)")!;

describe("generateProgression", () => {
  it("returns route assignments sorted by progression with generic read rules", () => {
    const steps = generateProgression(stick, trips, "middle");
    expect(steps.map((s) => s.progression)).toEqual([1, 2, 3, 4]);
    expect(steps.every((s) => s.readRule.length > 0)).toBe(true);
  });
});

describe("deriveRecommendedDropback", () => {
  it("picks a quick dropback for a shallow primary read (Stick's Sit route)", () => {
    expect(deriveRecommendedDropback(stick)).toBe("quick");
  });

  it("picks a deep dropback for a vertical primary read (Four Verticals' Seam)", () => {
    expect(deriveRecommendedDropback(fourVerts)).toBe("7-step");
  });
});

describe("deriveHotRoute", () => {
  it("picks the shallowest route in the concept as the hot read", () => {
    const hot = deriveHotRoute(stick);
    expect(hot?.role).toBe("RB");
    expect(hot?.routeName).toBe("Flat");
  });
});

describe("rateMatchup", () => {
  it("rates an explicit beater-concept matchup with 5 stars and a concrete reason", () => {
    const coverage = findCoverage("Cover 3 Buzz")!; // lists Stick as a beater
    const rating = rateMatchup(stick, coverage);
    expect(rating.tier).toBe("explicit");
    expect(rating.stars).toBe(5);
    expect(rating.reasons[0]).toContain("Stick");
  });

  it("falls back to a transparent heuristic when no explicit data exists", () => {
    const coverage = findCoverage("Cover 3 Sky")!; // does not list Stick
    const rating = rateMatchup(stick, coverage);
    expect(rating.tier).toBe("heuristic");
    expect(rating.stars).toBeGreaterThanOrEqual(1);
    expect(rating.stars).toBeLessThanOrEqual(5);
  });
});

describe("resolveKeyDefender", () => {
  it("resolves via a zone-label keyword match", () => {
    const coverage = findCoverage("Cover 3 Sky")!;
    const front = findFront("Nickel 4-2-5")!;
    const placed = placeDefense(front, coverage, "middle");
    const resolved = resolveKeyDefender("flat", coverage, new Set(front.dbSlots), placed, undefined);
    expect(resolved.source).toBe("zone-label");
    expect(resolved.id).toBe("SS");
  });

  it("resolves the 'corner' role via position when no zone label matches", () => {
    const coverage = findCoverage("Cover 4 Match-Quarters")!;
    const front = findFront("Nickel 4-2-5")!;
    const resolved = resolveKeyDefender("corner", coverage, new Set(front.dbSlots), [], undefined);
    expect(resolved.source).toBe("position");
    expect(["CB1", "CB2"]).toContain(resolved.id);
  });

  it("falls back to the nearest man defender when no zone/position data applies", () => {
    const coverage = findCoverage("Cover 0")!; // pure man, no zones
    const front = findFront("Nickel 4-2-5")!;
    const placed = placeDefense(front, coverage, "middle");
    const primaryReceiver = { x: 4, y: -1 }; // roughly where X lines up
    const resolved = resolveKeyDefender("flat", coverage, new Set(front.dbSlots), placed, primaryReceiver);
    expect(resolved.source).toBe("man-match");
    expect(resolved.id.length).toBeGreaterThan(0);
  });

  it("honestly reports when nothing can be resolved", () => {
    const coverage = findCoverage("Cover 0")!;
    const resolved = resolveKeyDefender("seam", coverage, new Set(), [], undefined);
    expect(resolved.source).toBe("unresolved");
  });
});

describe("generatePreSnapRead", () => {
  it("includes safety shell, corner depth, box count, and blitz indicators", () => {
    const coverage = findCoverage("Cover 2 Zone")!;
    const front = findFront("4-3 Over")!;
    const reads = generatePreSnapRead(coverage, front, "Fire Zone (3-Under/3-Deep)");
    const labels = reads.map((r) => r.label);
    expect(labels).toContain("Safety-Shell");
    expect(labels).toContain("Corner-Tiefe/Leverage");
    expect(labels).toContain("Box-Count");
    expect(reads.find((r) => r.label === "Box-Count")?.detail).toContain("7");
    expect(reads.find((r) => r.label === "Blitz-Indikatoren")?.detail).toContain("Fire Zone");
  });
});

describe("generateReadExplanation", () => {
  it("bundles a full explanation for a known-good matchup", () => {
    const explanation = generateReadExplanation(
      stick,
      findCoverage("Cover 3 Buzz")!,
      trips,
      "middle",
      findFront("Nickel 4-2-5")!,
      undefined,
    );
    expect(explanation.rating.tier).toBe("explicit");
    expect(explanation.progression.length).toBeGreaterThan(0);
    expect(explanation.dropback).toBe("quick");
  });

  it("still produces an honest explanation for Smash vs. a coverage with no corner zone label", () => {
    const explanation = generateReadExplanation(smash, findCoverage("Cover 4 Match-Quarters")!, trips, "middle", findFront("Nickel 4-2-5")!);
    expect(explanation.keyDefender.source).not.toBe("unresolved");
  });
});
