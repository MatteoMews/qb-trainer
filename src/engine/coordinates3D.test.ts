import { describe, expect, it } from "vitest";
import { FIELD_WIDTH_YD } from "../data/field";
import { playPointToWorld } from "./coordinates3D";

describe("playPointToWorld", () => {
  it("centers cross-field x around 0", () => {
    const world = playPointToWorld({ x: 0, y: 0 }, 50);
    expect(world.x).toBeCloseTo(-FIELD_WIDTH_YD / 2);

    const center = playPointToWorld({ x: FIELD_WIDTH_YD / 2, y: 0 }, 50);
    expect(center.x).toBeCloseTo(0);
  });

  it("keeps players on the ground plane", () => {
    expect(playPointToWorld({ x: 10, y: 5 }, 50).y).toBe(0);
  });

  it("moves further downfield (larger absolute yard line) into more negative z", () => {
    const atLos = playPointToWorld({ x: 26, y: 0 }, 50);
    const downfield = playPointToWorld({ x: 26, y: 10 }, 50);
    expect(downfield.z).toBeLessThan(atLos.z);
  });
});
