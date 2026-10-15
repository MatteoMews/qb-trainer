import { describe, expect, it } from "vitest";
import { FIELD_WIDTH_YD, HASH_FROM_SIDELINE_YD, hashX } from "./field";

describe("hashX", () => {
  it("places the left hash 20 yd from the left sideline (NCAA)", () => {
    expect(hashX("left")).toBe(HASH_FROM_SIDELINE_YD);
  });

  it("places the right hash 20 yd from the right sideline (NCAA)", () => {
    expect(hashX("right")).toBe(FIELD_WIDTH_YD - HASH_FROM_SIDELINE_YD);
  });

  it("places the middle hash exactly between the sidelines", () => {
    expect(hashX("middle")).toBeCloseTo(FIELD_WIDTH_YD / 2);
  });

  it("separates left and right hashes by 40 ft (13 1/3 yd), per NCAA rules", () => {
    expect(hashX("right") - hashX("left")).toBeCloseTo(40 / 3);
  });
});
