import { describe, expect, it } from "vitest";
import { findCoverage } from "../data/coverages";
import { findFront } from "../data/fronts";
import { placeDefense } from "./placeDefense";

describe("placeDefense", () => {
  it("combines a 7-box front with a 4-DB coverage into 11 defenders", () => {
    const front = findFront("4-3 Over")!;
    const coverage = findCoverage("Cover 3 Sky")!;

    const placed = placeDefense(front, coverage, "middle");

    expect(placed.length).toBe(11);
    expect(placed.filter((p) => p.group === "box").length).toBe(7);
    expect(placed.filter((p) => p.group === "secondary").length).toBe(4);
  });

  it("skips coverage roles the front doesn't provide a slot for (e.g. NB on a base front)", () => {
    const front = findFront("4-3 Over")!; // dbSlots has no "NB"
    const coverage = findCoverage("Cover 0")!; // defines an NB role

    const placed = placeDefense(front, coverage, "middle");

    expect(placed.some((p) => p.id === "NB")).toBe(false);
  });

  it("places a Nickel front's 5 DB slots including the NB", () => {
    const front = findFront("Nickel 4-2-5")!;
    const coverage = findCoverage("Cover 1 Free")!;

    const placed = placeDefense(front, coverage, "middle");

    expect(placed.length).toBe(11);
    expect(placed.some((p) => p.id === "NB")).toBe(true);
  });

  it("shifts every defender by the same amount when the hash changes", () => {
    const front = findFront("4-3 Over")!;
    const coverage = findCoverage("Cover 3 Sky")!;

    const onLeft = placeDefense(front, coverage, "left");
    const onRight = placeDefense(front, coverage, "right");
    const mlbLeft = onLeft.find((p) => p.id === "MLB")!;
    const mlbRight = onRight.find((p) => p.id === "MLB")!;

    expect(mlbRight.start.x).toBeGreaterThan(mlbLeft.start.x);
  });
});
