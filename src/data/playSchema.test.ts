import { describe, expect, it } from "vitest";
import { findConcept } from "./concepts";
import { findFormation } from "./formations";
import { buildPlay } from "../engine/buildPlay";
import { parsePlayJson } from "./playSchema";

describe("parsePlayJson", () => {
  it("accepts a valid, previously exported play", () => {
    const play = buildPlay({
      name: "Trips Right Stick",
      formation: findFormation("Trips Right (3x1)")!,
      concept: findConcept("Stick")!,
      hash: "middle",
      yardLine: 35,
    });
    const result = parsePlayJson(JSON.stringify(play));
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe("Trips Right Stick");
  });

  it("reports malformed JSON in plain language", () => {
    const result = parsePlayJson("{not valid json");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Ungültiges JSON");
  });

  it("reports schema violations with a field path", () => {
    const result = parsePlayJson(JSON.stringify({ schemaVersion: 1, type: "play" }));
    expect(result.success).toBe(false);
    expect(result.error).toContain("name");
  });
});
