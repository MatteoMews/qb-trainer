import { FIELD_WIDTH_YD, type Hash } from "../data/field";
import type { Play } from "../data/playSchema";
import type { Point } from "../data/schemas";

function mirrorPoint(point: Point): Point {
  return { x: FIELD_WIDTH_YD - point.x, y: point.y };
}

function mirrorHash(hash: Hash): Hash {
  if (hash === "left") return "right";
  if (hash === "right") return "left";
  return "middle";
}

/** Spiegelt einen kompletten Play links/rechts: Ballposition (Hash), alle Spieler-Startpositionen
 *  und alle Routen-Wegpunkte. Formation/Konzept-Namen bleiben unverändert (Labels wie X/Z/H
 *  sind feste Identifier, siehe formations.ts). */
export function mirrorPlay(play: Play): Play {
  return {
    ...play,
    name: `${play.name} (gespiegelt)`,
    ball: { ...play.ball, hash: mirrorHash(play.ball.hash) },
    offense: {
      ...play.offense,
      players: play.offense.players.map((player) => ({
        ...player,
        start: mirrorPoint(player.start),
        task:
          player.task.type === "route"
            ? { ...player.task, route: player.task.route.map(mirrorPoint) }
            : player.task,
      })),
    },
  };
}
