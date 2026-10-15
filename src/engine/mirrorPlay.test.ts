import { describe, expect, it } from "vitest";
import { FIELD_WIDTH_YD } from "../data/field";
import { findConcept } from "../data/concepts";
import { findFormation } from "../data/formations";
import { buildPlay } from "./buildPlay";
import { mirrorPlay } from "./mirrorPlay";

describe("mirrorPlay", () => {
  const original = buildPlay({
    name: "Trips Right Stick",
    formation: findFormation("Trips Right (3x1)")!,
    concept: findConcept("Stick")!,
    hash: "left",
    yardLine: 35,
  });

  it("flips the ball's hash", () => {
    expect(mirrorPlay(original).ball.hash).toBe("right");
  });

  it("mirrors every player's start position across the field center", () => {
    const mirrored = mirrorPlay(original);
    for (let i = 0; i < original.offense.players.length; i++) {
      expect(mirrored.offense.players[i].start.x).toBeCloseTo(FIELD_WIDTH_YD - original.offense.players[i].start.x);
      expect(mirrored.offense.players[i].start.y).toBeCloseTo(original.offense.players[i].start.y);
    }
  });

  it("mirrors route waypoints too", () => {
    const mirrored = mirrorPlay(original);
    const originalRoute = original.offense.players.find((p) => p.task.type === "route")!;
    const mirroredRoute = mirrored.offense.players.find((p) => p.id === originalRoute.id)!;
    if (originalRoute.task.type !== "route" || mirroredRoute.task.type !== "route") {
      throw new Error("expected route assignments");
    }
    expect(mirroredRoute.task.route[0].x).toBeCloseTo(FIELD_WIDTH_YD - originalRoute.task.route[0].x);
  });

  it("is idempotent in field position when mirrored twice", () => {
    const twice = mirrorPlay(mirrorPlay(original));
    expect(twice.ball.hash).toBe(original.ball.hash);
    expect(twice.offense.players[0].start.x).toBeCloseTo(original.offense.players[0].start.x);
  });
});
