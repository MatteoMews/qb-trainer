import { clampCrossField, hashX, type Hash } from "../data/field";
import type { Coverage } from "../data/coverages";
import type { Front } from "../data/fronts";
import type { DefensePosition } from "../data/positions";
import type { Point } from "../data/schemas";

export interface PlacedDefender {
  id: string;
  position: DefensePosition;
  start: Point;
  /** "box" = Teil der Front (DL/LB), "secondary" = Teil der Coverage (DB). */
  group: "box" | "secondary";
}

/** Platziert eine Front + Coverage auf dem Feld an einem bestimmten Hash. Nur Coverage-Rollen,
 *  die `front.dbSlots` auch vorsieht, werden übernommen (siehe fronts.ts). */
export function placeDefense(front: Front, coverage: Coverage, hash: Hash): PlacedDefender[] {
  const ballX = hashX(hash);

  const boxPlayers: PlacedDefender[] = front.players.map((player) => ({
    id: player.id,
    position: player.position,
    start: { x: clampCrossField(ballX + player.offset.dx), y: player.offset.y },
    group: "box",
  }));

  const secondaryPlayers: PlacedDefender[] = coverage.players
    .filter((player) => front.dbSlots.includes(player.id))
    .map((player) => ({
      id: player.id,
      position: player.position,
      start: { x: clampCrossField(ballX + player.offset.dx), y: player.offset.y },
      group: "secondary",
    }));

  return [...boxPlayers, ...secondaryPlayers];
}
