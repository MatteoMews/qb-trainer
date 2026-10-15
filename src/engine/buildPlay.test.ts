import { describe, expect, it } from "vitest";
import { findConcept } from "../data/concepts";
import { findFormation } from "../data/formations";
import { PlaySchema } from "../data/playSchema";
import { buildPlay } from "./buildPlay";

describe("buildPlay", () => {
  it("produces a play that satisfies the documented exchange schema", () => {
    const play = buildPlay({
      name: "Trips Right Stick",
      formation: findFormation("Trips Right (3x1)")!,
      concept: findConcept("Stick")!,
      hash: "left",
      yardLine: 35,
    });

    const result = PlaySchema.safeParse(play);
    expect(result.success).toBe(true);
  });

  it("only includes players the concept actually assigns", () => {
    const play = buildPlay({
      name: "Doubles Spacing",
      formation: findFormation("Doubles (2x2)")!,
      concept: findConcept("Spacing")!,
      hash: "middle",
      yardLine: 50,
    });

    const ids = play.offense.players.map((p) => p.id);
    expect(ids).not.toContain("H");
  });
});
