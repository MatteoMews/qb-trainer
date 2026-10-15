import { clampCrossField, hashX, type Hash } from "../data/field";
import type { Formation, FormationPlayer } from "../data/formations";
import type { Point } from "../data/schemas";

export interface PlacedPlayer extends Pick<FormationPlayer, "id" | "position"> {
  start: Point;
}

/** Platziert eine Formation auf dem Feld: löst die ball-relativen Offsets in absolute
 *  Play-Koordinaten auf, abhängig von der Hash-Position des Balls. */
export function placeFormation(formation: Formation, hash: Hash): PlacedPlayer[] {
  const ballX = hashX(hash);
  return formation.players.map((player) => ({
    id: player.id,
    position: player.position,
    start: { x: clampCrossField(ballX + player.offset.dx), y: player.offset.y },
  }));
}
