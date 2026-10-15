import { findFormation } from "../data/formations";
import { findCoverage } from "../data/coverages";
import type { Play } from "../data/playSchema";
import type { Defense } from "../data/defenseSchema";
import type { Point } from "../data/schemas";
import { placeFormation } from "./formationPlacement";
import { buildTimeline, sampleTimeline } from "./timeline";

/**
 * Gemeinsame deterministische Simulations-Engine für 2D und 3D (siehe Projektauftrag 5.3):
 * `getFrameAt(play, defense, t)` liefert für jeden Zeitpunkt t (0..SIM_DURATION_S) die Position
 * jedes Spielers. 2D- und 3D-Ansicht lesen beide nur diesen einen Zustand.
 *
 * // TODO(Football-Check): Geschwindigkeiten, Break-Pausen, Coverage-Lag und Zonen-Reaktionen
 * // sind plausible Richtwerte für ein Trainingsbild, keine physikalische Simulation. Linebacker
 * // ohne explizite Zonen-Koordinaten (siehe coverages.ts) bekommen einen generischen
 * // Hook/Curl-Drop statt ihrer tatsächlichen, spielzugabhängigen Zone - bitte prüfen.
 */

export const SIM_DURATION_S = 5;
export const WR_SPRINT_SPEED_YD_S = 8.5;
export const BREAK_PAUSE_S = 0.15;
export const MAN_COVERAGE_LAG_S = 0.25;
export const ZONE_DROP_DURATION_S = 1.8;
export const ZONE_REACTION_RADIUS_YD = 8;
export const ZONE_MAX_PULL_YD = 3;
export const GENERIC_LB_DROP_DEPTH_YD = 4;
export const RUSH_SPEED_YD_S = 6;
export const RUSH_MIN_STANDOFF_YD = 1;
export const QB_DROPBACK_DURATION_S = 1.2;

export interface SimPlayer {
  id: string;
  position: string;
  x: number;
  y: number;
}

export interface SimFrame {
  t: number;
  offense: SimPlayer[];
  defense: SimPlayer[];
}

const ELIGIBLE_RECEIVER_POSITIONS = new Set(["WR", "TE", "RB", "FB"]);
const SECONDARY_POSITIONS = new Set(["CB", "NB", "FS", "SS", "S"]);
const LB_POSITIONS = new Set(["OLB", "MLB", "ILB"]);

const DROPBACK_DEPTH_YD: Record<string, number> = {
  quick: 1,
  "3-step": 3,
  "5-step": 5,
  "7-step": 7,
  "play-action": 6,
  rpo: 2,
};

function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function pullToward(from: Point, target: Point, maxDist: number): Point {
  const dx = target.x - from.x;
  const dy = target.y - from.y;
  const dist = Math.hypot(dx, dy);
  if (dist <= maxDist) return target;
  const ratio = maxDist / dist;
  return { x: from.x + dx * ratio, y: from.y + dy * ratio };
}

function qbPositionAtTime(start: Point, dropback: string, qbAlignment: string, t: number): Point {
  const baseDepth = DROPBACK_DEPTH_YD[dropback] ?? 5;
  // Shotgun/Pistol-QBs stehen bereits tiefer im Backfield; sie legen post-snap weniger
  // zusätzliche Tiefe zurück als ein Under-Center-QB.
  const extraDepth = qbAlignment === "under-center" ? baseDepth : baseDepth * 0.4;
  const target: Point = { x: start.x, y: start.y - extraDepth };
  if (t >= QB_DROPBACK_DURATION_S) return target;
  const frac = t / QB_DROPBACK_DURATION_S;
  return { x: start.x, y: start.y + (target.y - start.y) * frac };
}

/** Positionen aller Offense-Spieler (inkl. QB/OL, rekonstruiert aus der gespeicherten Formation)
 *  zum Zeitpunkt t. */
export function getOffensePositionsAtTime(play: Play, t: number): SimPlayer[] {
  const assignedById = new Map(play.offense.players.map((p) => [p.id, p]));
  const formation = findFormation(play.offense.formation);

  if (!formation) {
    return play.offense.players.map((p) => {
      if (p.task.type === "route") {
        const timeline = buildTimeline(p.start, p.task.route, WR_SPRINT_SPEED_YD_S, BREAK_PAUSE_S);
        const point = sampleTimeline(timeline, t);
        return { id: p.id, position: p.position, x: point.x, y: point.y };
      }
      return { id: p.id, position: p.position, x: p.start.x, y: p.start.y };
    });
  }

  const placed = placeFormation(formation, play.ball.hash);

  return placed.map((player) => {
    if (player.id === "QB") {
      const point = qbPositionAtTime(player.start, play.offense.dropback, play.offense.qbAlignment, t);
      return { id: player.id, position: player.position, x: point.x, y: point.y };
    }
    const assignment = assignedById.get(player.id);
    if (!assignment || assignment.task.type === "block") {
      return { id: player.id, position: player.position, x: player.start.x, y: player.start.y };
    }
    const timeline = buildTimeline(player.start, assignment.task.route, WR_SPRINT_SPEED_YD_S, BREAK_PAUSE_S);
    const point = sampleTimeline(timeline, t);
    return { id: player.id, position: player.position, x: point.x, y: point.y };
  });
}

function greedyNearestAssignment(
  defenders: readonly { id: string; x: number; y: number }[],
  receivers: readonly { id: string; x: number; y: number }[],
): Map<string, string> {
  const pairs = defenders.flatMap((d) => receivers.map((r) => ({ defenderId: d.id, receiverId: r.id, dist: distance(d, r) })));
  pairs.sort((a, b) => a.dist - b.dist);

  const usedDefenders = new Set<string>();
  const usedReceivers = new Set<string>();
  const assignment = new Map<string, string>();

  for (const pair of pairs) {
    if (usedDefenders.has(pair.defenderId) || usedReceivers.has(pair.receiverId)) continue;
    assignment.set(pair.defenderId, pair.receiverId);
    usedDefenders.add(pair.defenderId);
    usedReceivers.add(pair.receiverId);
  }
  return assignment;
}

function rusherPosition(start: Point, qb: Point, t: number): Point {
  const totalDist = distance(start, qb);
  if (totalDist === 0) return start;
  const traveled = Math.min(RUSH_SPEED_YD_S * t, Math.max(0, totalDist - RUSH_MIN_STANDOFF_YD));
  const ratio = traveled / totalDist;
  return { x: start.x + (qb.x - start.x) * ratio, y: start.y + (qb.y - start.y) * ratio };
}

function derivePreSnapY(finalY: number): number {
  const reduction = finalY > 8 ? 6 : 2;
  return Math.max(0.5, finalY - reduction);
}

function zoneDropPosition(preSnap: Point, landmark: Point, t: number): Point {
  if (t >= ZONE_DROP_DURATION_S) return landmark;
  const frac = t / ZONE_DROP_DURATION_S;
  return { x: preSnap.x + (landmark.x - preSnap.x) * frac, y: preSnap.y + (landmark.y - preSnap.y) * frac };
}

function applyZoneReaction(position: Point, offenseNow: readonly SimPlayer[], t: number): Point {
  if (t < ZONE_DROP_DURATION_S) return position;
  let nearest: SimPlayer | undefined;
  let nearestDist = Infinity;
  for (const o of offenseNow) {
    const d = distance(position, o);
    if (d < ZONE_REACTION_RADIUS_YD && d < nearestDist) {
      nearest = o;
      nearestDist = d;
    }
  }
  if (!nearest) return position;
  return pullToward(position, nearest, ZONE_MAX_PULL_YD);
}

/** Positionen aller Defense-Spieler zum Zeitpunkt t: Defensive Line rusht Richtung QB, Secondary
 *  (und bei Man-Coverages auch Linebacker) decken den nächstgelegenen Receiver mit Lag, sonst
 *  droppen sie zu ihrem Zonen-Landmark und reagieren leicht auf nahe Receiver. */
export function getDefensePositionsAtTime(defense: Defense, play: Play, t: number): SimPlayer[] {
  const coverage = findCoverage(defense.coverage);
  const coverageType = coverage?.coverageType ?? "zone";
  const offenseAtSnap = getOffensePositionsAtTime(play, 0);
  const offenseNow = getOffensePositionsAtTime(play, t);
  const eligibleReceivers = offenseAtSnap.filter((o) => ELIGIBLE_RECEIVER_POSITIONS.has(o.position));

  const manCandidates =
    coverageType === "man" ? defense.players.filter((p) => SECONDARY_POSITIONS.has(p.position) || LB_POSITIONS.has(p.position)) : [];
  const assignment = greedyNearestAssignment(
    manCandidates.map((p) => ({ id: p.id, x: p.start.x, y: p.start.y })),
    eligibleReceivers,
  );

  const qbNow = offenseNow.find((o) => o.id === "QB");

  return defense.players.map((defender) => {
    const isSecondary = SECONDARY_POSITIONS.has(defender.position);
    const isLb = LB_POSITIONS.has(defender.position);
    const isDl = !isSecondary && !isLb;

    if (isDl) {
      const point = rusherPosition(defender.start, qbNow ?? { x: defender.start.x, y: defender.start.y - 5 }, t);
      return { id: defender.id, position: defender.position, x: point.x, y: point.y };
    }

    if (coverageType === "man") {
      const receiverId = assignment.get(defender.id);
      if (receiverId) {
        const lagT = Math.max(0, t - MAN_COVERAGE_LAG_S);
        const receiverThen = getOffensePositionsAtTime(play, lagT).find((o) => o.id === receiverId);
        if (receiverThen) return { id: defender.id, position: defender.position, x: receiverThen.x, y: receiverThen.y };
      }
    }

    const landmark: Point = isSecondary
      ? { x: defender.start.x, y: defender.start.y }
      : { x: defender.start.x, y: defender.start.y + GENERIC_LB_DROP_DEPTH_YD };
    const preSnap: Point = isSecondary ? { x: landmark.x, y: derivePreSnapY(landmark.y) } : { x: defender.start.x, y: defender.start.y };
    const dropped = zoneDropPosition(preSnap, landmark, t);
    const reacted = applyZoneReaction(dropped, offenseNow, t);
    return { id: defender.id, position: defender.position, x: reacted.x, y: reacted.y };
  });
}

/** Der zentrale Einstiegspunkt: ein Zustand für Offense + Defense zu einem Zeitpunkt t,
 *  gemeinsam genutzt von 2D- und (später) 3D-Ansicht. */
export function getFrameAt(play: Play, defense: Defense, t: number): SimFrame {
  const clampedT = Math.min(SIM_DURATION_S, Math.max(0, t));
  return {
    t: clampedT,
    offense: getOffensePositionsAtTime(play, clampedT),
    defense: getDefensePositionsAtTime(defense, play, clampedT),
  };
}
