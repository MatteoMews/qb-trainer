import { describe, expect, it, vi } from "vitest";
import { computeItemWeight, weightedPickByAccuracy, weightedRandomPick } from "./adaptiveWeighting";

describe("computeItemWeight", () => {
  it("gives neutral weight when there is no history", () => {
    expect(computeItemWeight(undefined)).toBe(1);
  });

  it("gives a higher weight to items with lower accuracy", () => {
    expect(computeItemWeight(0.9)).toBeLessThan(computeItemWeight(0.2));
  });

  it("never drops below the minimum weight, even at perfect accuracy", () => {
    expect(computeItemWeight(1)).toBeGreaterThan(0);
  });
});

describe("weightedRandomPick", () => {
  it("always picks the only item with nonzero weight", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.99);
    expect(weightedRandomPick(["a", "b", "c"], [0, 10, 0])).toBe("b");
    spy.mockRestore();
  });

  it("falls back to uniform pick when all weights are zero", () => {
    const spy = vi.spyOn(Math, "random").mockReturnValue(0);
    expect(weightedRandomPick(["a", "b"], [0, 0])).toBe("a");
    spy.mockRestore();
  });
});

describe("weightedPickByAccuracy", () => {
  it("favors items the learner often gets wrong", () => {
    const accuracy = new Map([
      ["Cover 3 Sky", 0.95],
      ["Cover 0", 0.1],
    ]);
    const spy = vi.spyOn(Math, "random").mockReturnValue(0.5);
    const picked = weightedPickByAccuracy(["Cover 3 Sky", "Cover 0"], (name) => name, accuracy);
    spy.mockRestore();
    expect(picked).toBe("Cover 0");
  });
});
