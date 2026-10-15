import { describe, expect, it } from "vitest";
import { findCoverage } from "./coverages";
import { findFront } from "./fronts";
import { buildDefense } from "../engine/buildDefense";
import { parseDefenseJson } from "./defenseSchema";

describe("parseDefenseJson", () => {
  it("accepts a valid, previously exported defense", () => {
    const defense = buildDefense({
      name: "Nickel Cover 3 Sky",
      front: findFront("Nickel 4-2-5")!,
      coverage: findCoverage("Cover 3 Sky")!,
      hash: "middle",
    });
    const result = parseDefenseJson(JSON.stringify(defense));
    expect(result.success).toBe(true);
    expect(result.data?.coverage).toBe("Cover 3 Sky");
  });

  it("reports malformed JSON in plain language", () => {
    const result = parseDefenseJson("not json at all");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Ungültiges JSON");
  });

  it("reports schema violations with a field path", () => {
    const result = parseDefenseJson(JSON.stringify({ schemaVersion: 1, type: "defense" }));
    expect(result.success).toBe(false);
    expect(result.error).toContain("name");
  });
});
