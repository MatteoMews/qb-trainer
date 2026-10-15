import { describe, expect, it } from "vitest";
import { findCoverage } from "../data/coverages";
import { DefenseSchema } from "../data/defenseSchema";
import { findFront } from "../data/fronts";
import { buildDefense } from "./buildDefense";

describe("buildDefense", () => {
  it("produces a defense that satisfies the documented exchange schema", () => {
    const defense = buildDefense({
      name: "Nickel Cover 3 Sky",
      front: findFront("Nickel 4-2-5")!,
      coverage: findCoverage("Cover 3 Sky")!,
      hash: "left",
    });

    const result = DefenseSchema.safeParse(defense);
    expect(result.success).toBe(true);
  });

  it("attaches zone labels as player roles where the coverage defines them", () => {
    const defense = buildDefense({
      name: "Nickel Cover 3 Sky",
      front: findFront("Nickel 4-2-5")!,
      coverage: findCoverage("Cover 3 Sky")!,
      hash: "middle",
    });

    const fs = defense.players.find((p) => p.id === "FS")!;
    expect(fs.role).toBe("Deep Third (Mitte)");
  });

  it("records the disguised pre-snap coverage separately from the actual one", () => {
    const defense = buildDefense({
      name: "Disguised Cover 3",
      front: findFront("Nickel 4-2-5")!,
      coverage: findCoverage("Cover 3 Sky")!,
      disguisedAsCoverage: findCoverage("Cover 2 Zone")!,
      hash: "middle",
    });

    expect(defense.coverage).toBe("Cover 3 Sky");
    expect(defense.disguisedAsCoverage).toBe("Cover 2 Zone");
  });
});
