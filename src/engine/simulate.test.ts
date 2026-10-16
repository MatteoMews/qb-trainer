import { describe, expect, it } from "vitest";
import { findConcept } from "../data/concepts";
import { findCoverage } from "../data/coverages";
import { findFormation } from "../data/formations";
import { findFront } from "../data/fronts";
import { buildDefense } from "./buildDefense";
import { buildPlay } from "./buildPlay";
import {
  GENERIC_LB_DROP_DEPTH_YD,
  MAN_COVERAGE_LAG_S,
  QB_DROPBACK_DURATION_S,
  SIM_DURATION_S,
  ZONE_DROP_DURATION_S,
  getDefensePositionsAtTime,
  getFrameAt,
  getOffensePositionsAtTime,
} from "./simulate";

const play = buildPlay({
  name: "Trips Right Stick",
  formation: findFormation("Trips Right (3x1)")!,
  concept: findConcept("Stick")!,
  hash: "middle",
  yardLine: 50,
});

const manDefense = buildDefense({
  name: "Nickel Cover 0",
  front: findFront("Nickel 4-2-5")!,
  coverage: findCoverage("Cover 0")!,
  hash: "middle",
});

const zoneDefense = buildDefense({
  name: "4-3 Cover 3 Sky",
  front: findFront("4-3 Over")!,
  coverage: findCoverage("Cover 3 Sky")!,
  hash: "middle",
});

describe("getOffensePositionsAtTime", () => {
  it("includes the full 11-man offense (QB/OL reconstructed from the formation)", () => {
    const positions = getOffensePositionsAtTime(play, 0);
    expect(positions.length).toBe(11);
    expect(positions.some((p) => p.id === "QB")).toBe(true);
    expect(positions.some((p) => p.id === "LT")).toBe(true);
  });

  it("moves a route-assigned receiver toward their route's final waypoint over time", () => {
    const receiver = play.offense.players.find((p) => p.task.type === "route")!;
    if (receiver.task.type !== "route") throw new Error("expected a route assignment");
    const finalWaypoint = receiver.task.route.at(-1)!;

    const atEnd = getOffensePositionsAtTime(play, SIM_DURATION_S).find((p) => p.id === receiver.id)!;
    expect(atEnd.x).toBeCloseTo(finalWaypoint.x, 1);
    expect(atEnd.y).toBeCloseTo(finalWaypoint.y, 1);
  });

  it("drops the under-center QB backward during the dropback window, then holds", () => {
    const ucPlay = buildPlay({
      name: "I-Form Dropback",
      formation: findFormation("I-Form Pro")!,
      concept: findConcept("Curl-Flat")!,
      hash: "middle",
      yardLine: 50,
    });
    const atSnap = getOffensePositionsAtTime(ucPlay, 0).find((p) => p.id === "QB")!;
    const midDrop = getOffensePositionsAtTime(ucPlay, QB_DROPBACK_DURATION_S / 2).find((p) => p.id === "QB")!;
    const afterDrop = getOffensePositionsAtTime(ucPlay, QB_DROPBACK_DURATION_S + 1).find((p) => p.id === "QB")!;

    expect(midDrop.y).toBeLessThan(atSnap.y);
    expect(afterDrop.y).toBeLessThan(midDrop.y);

    const muchLater = getOffensePositionsAtTime(ucPlay, SIM_DURATION_S).find((p) => p.id === "QB")!;
    expect(muchLater.y).toBeCloseTo(afterDrop.y);
  });
});

describe("getDefensePositionsAtTime", () => {
  it("keeps defensive linemen static at the line of scrimmage (kein simuliertes Blocking/Pass-Rush)", () => {
    const atSnap = getDefensePositionsAtTime(manDefense, play, 0).find((p) => p.position === "DE")!;
    const later = getDefensePositionsAtTime(manDefense, play, 2).find((p) => p.id === atSnap.id)!;

    expect(later.x).toBeCloseTo(atSnap.x);
    expect(later.y).toBeCloseTo(atSnap.y);
  });

  it("tracks the nearest receiver in man coverage with a time lag", () => {
    // CB1 lines up right on top of X (the only receiver on that side) at the snap, so the
    // greedy nearest-neighbor assignment should pair them with very high confidence.
    const cb1AtSnap = getDefensePositionsAtTime(manDefense, play, 0).find((p) => p.id === "CB1")!;
    const defAtLater = getDefensePositionsAtTime(manDefense, play, 1.5).find((p) => p.id === "CB1")!;
    const receiverAtLag = getOffensePositionsAtTime(play, 1.5 - MAN_COVERAGE_LAG_S);

    const closest = receiverAtLag.reduce((best, r) => {
      const d = Math.hypot(defAtLater.x - r.x, defAtLater.y - r.y);
      const bestD = Math.hypot(defAtLater.x - best.x, defAtLater.y - best.y);
      return d < bestD ? r : best;
    });
    const distToClosestReceiver = Math.hypot(defAtLater.x - closest.x, defAtLater.y - closest.y);

    expect(distToClosestReceiver).toBeLessThan(0.5);
    // It should have moved from its own static alignment to follow the receiver.
    expect(Math.hypot(defAtLater.x - cb1AtSnap.x, defAtLater.y - cb1AtSnap.y)).toBeGreaterThan(0.5);
  });

  it("drops a zone secondary defender from a shallower pre-snap spot to its Phase-3 landmark", () => {
    const landmark = findCoverage("Cover 3 Sky")!.players.find((p) => p.id === "FS")!.offset;
    const atSnap = getDefensePositionsAtTime(zoneDefense, play, 0).find((p) => p.id === "FS")!;
    const settled = getDefensePositionsAtTime(zoneDefense, play, ZONE_DROP_DURATION_S + 1).find((p) => p.id === "FS")!;

    expect(atSnap.y).toBeLessThan(landmark.y);
    expect(settled.y).toBeCloseTo(landmark.y, 0);
  });

  it("gives linebackers a generic hook/curl drop deeper than their front alignment in zone coverage", () => {
    const front = findFront("4-3 Over")!;
    const mlbAlignment = front.players.find((p) => p.id === "MLB")!.offset;
    const settled = getDefensePositionsAtTime(zoneDefense, play, ZONE_DROP_DURATION_S + 1).find((p) => p.id === "MLB")!;

    expect(settled.y).toBeCloseTo(mlbAlignment.y + GENERIC_LB_DROP_DEPTH_YD, 0);
  });
});

describe("getFrameAt", () => {
  it("returns a full offense and defense roster at a given time", () => {
    const frame = getFrameAt(play, zoneDefense, 2);
    expect(frame.offense.length).toBe(11);
    expect(frame.defense.length).toBe(11);
    expect(frame.t).toBe(2);
  });

  it("clamps the requested time into [0, SIM_DURATION_S]", () => {
    expect(getFrameAt(play, zoneDefense, -5).t).toBe(0);
    expect(getFrameAt(play, zoneDefense, 999).t).toBe(SIM_DURATION_S);
  });
});
