import { describe, expect, it } from "vitest";
import { findConcept } from "../data/concepts";
import { findFormation } from "../data/formations";
import { applyConcept } from "./applyConcept";

describe("applyConcept", () => {
  it("resolves every assignment whose role exists in the formation", () => {
    const stick = findConcept("Stick")!;
    const trips = findFormation("Trips Right (3x1)")!;

    const applied = applyConcept(stick, trips, "middle");

    const ids = applied.map((a) => a.id);
    expect(ids).toEqual(["H", "RB", "Z", "X"]);
  });

  it("generates route waypoints for route assignments", () => {
    const stick = findConcept("Stick")!;
    const trips = findFormation("Trips Right (3x1)")!;

    const applied = applyConcept(stick, trips, "middle");
    const hAssignment = applied.find((a) => a.id === "H")!;

    expect(hAssignment.task.type).toBe("route");
    expect(hAssignment.route).toBeDefined();
    expect(hAssignment.route!.length).toBeGreaterThan(0);
  });

  it("skips roles that don't exist in the chosen formation", () => {
    const spacing = findConcept("Spacing")!;
    // Doubles has X, Z, F but no H -> Spacing's H-assignment should be skipped.
    const doubles = findFormation("Doubles (2x2)")!;

    const applied = applyConcept(spacing, doubles, "middle");

    expect(applied.some((a) => a.id === "H")).toBe(false);
  });

  it("marks block assignments without generating a route", () => {
    const bubbleScreen = findConcept("Bubble Screen")!;
    const trips = findFormation("Trips Right (3x1)")!;

    const applied = applyConcept(bubbleScreen, trips, "middle");
    const blocker = applied.find((a) => a.id === "X")!;

    expect(blocker.task.type).toBe("block");
    expect(blocker.route).toBeUndefined();
  });
});
