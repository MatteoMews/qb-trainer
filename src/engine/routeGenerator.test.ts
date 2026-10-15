import { describe, expect, it } from "vitest";
import { generateRoute } from "./routeGenerator";

describe("generateRoute", () => {
  it("breaks an Out route toward the sideline (away from the ball)", () => {
    const rightSide = generateRoute("Out", { startX: 40, side: "right" });
    const leftSide = generateRoute("Out", { startX: 13.33, side: "left" });

    expect(rightSide.at(-1)!.x).toBeGreaterThan(40);
    expect(leftSide.at(-1)!.x).toBeLessThan(13.33);
  });

  it("breaks a Dig route toward the ball (opposite of Out)", () => {
    const rightSide = generateRoute("Dig", { startX: 40, side: "right" });
    const leftSide = generateRoute("Dig", { startX: 13.33, side: "left" });

    expect(rightSide.at(-1)!.x).toBeLessThan(40);
    expect(leftSide.at(-1)!.x).toBeGreaterThan(13.33);
  });

  it("runs a Go route straight downfield with minimal lateral drift", () => {
    const waypoints = generateRoute("Go", { startX: 40, side: "right" });
    const last = waypoints.at(-1)!;

    expect(last.y).toBeCloseTo(22);
    expect(Math.abs(last.x - 40)).toBeLessThanOrEqual(2);
  });

  it("scales the route proportionally when depthYd is overridden", () => {
    const defaultDepth = generateRoute("Slant", { startX: 26, side: "right" });
    const doubled = generateRoute("Slant", { startX: 26, side: "right", depthYd: 6 });

    expect(doubled.at(-1)!.y).toBeCloseTo(defaultDepth.at(-1)!.y * 2);
  });

  it("clamps waypoints to stay within the field boundaries", () => {
    const waypoints = generateRoute("Out", { startX: 1, side: "left" });
    for (const point of waypoints) {
      expect(point.x).toBeGreaterThanOrEqual(0);
    }
  });
});
