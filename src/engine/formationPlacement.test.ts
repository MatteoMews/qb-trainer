import { describe, expect, it } from "vitest";
import { FIELD_WIDTH_YD } from "../data/field";
import { findFormation, mirrorFormation } from "../data/formations";
import { placeFormation } from "./formationPlacement";

const doubles = findFormation("Doubles (2x2)")!;

describe("placeFormation", () => {
  it("places the center on the ball's hash position", () => {
    const placed = placeFormation(doubles, "left");
    const center = placed.find((player) => player.id === "C")!;
    expect(center.start.x).toBeCloseTo(20);
  });

  it("shifts every player by the same amount when the hash changes", () => {
    const onLeftHash = placeFormation(doubles, "left");
    const onRightHash = placeFormation(doubles, "right");
    const qbLeft = onLeftHash.find((player) => player.id === "QB")!;
    const qbRight = onRightHash.find((player) => player.id === "QB")!;

    expect(qbRight.start.x - qbLeft.start.x).toBeCloseTo((FIELD_WIDTH_YD - 20) - 20);
  });

  it("clamps players toward the boundary so nobody lines up off the field", () => {
    const placed = placeFormation(doubles, "left");
    for (const player of placed) {
      expect(player.start.x).toBeGreaterThanOrEqual(0);
      expect(player.start.x).toBeLessThanOrEqual(FIELD_WIDTH_YD);
    }
  });
});

describe("mirrorFormation", () => {
  it("flips every player's lateral offset", () => {
    const mirrored = mirrorFormation(doubles);
    for (let i = 0; i < doubles.players.length; i++) {
      expect(mirrored.players[i].offset.dx).toBeCloseTo(-doubles.players[i].offset.dx);
      expect(mirrored.players[i].offset.y).toBeCloseTo(doubles.players[i].offset.y);
    }
  });

  it("is its own inverse", () => {
    const mirroredTwice = mirrorFormation(mirrorFormation(doubles));
    for (let i = 0; i < doubles.players.length; i++) {
      expect(mirroredTwice.players[i].offset.dx).toBeCloseTo(doubles.players[i].offset.dx);
    }
  });

  it("swaps Right/Left in the formation name", () => {
    const tripsRight = findFormation("Trips Right (3x1)")!;
    expect(mirrorFormation(tripsRight).name).toBe("Trips Left (3x1)");
  });
});
