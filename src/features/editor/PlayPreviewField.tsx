import { Field2D } from "../../components/Field2D";
import type { Play } from "../../data/playSchema";
import { playPointToSvg } from "../../engine/coordinates";
import { PlayerToken } from "./PlayerToken";
import { RoutePath } from "./RoutePath";

export interface PlayPreviewFieldProps {
  play: Play;
}

/** Rendert einen Play direkt aus seinen gespeicherten Spieler-/Routen-Daten (ohne Formation/
 *  Konzept neu aufzulösen) - für die Import-Vorschau, bei der der Play aus beliebigem JSON
 *  stammen kann. */
export function PlayPreviewField({ play }: PlayPreviewFieldProps) {
  const ballYardLine = play.ball.yardLine;

  return (
    <Field2D>
      {play.offense.players.map(
        (player) =>
          player.task.type === "route" && (
            <RoutePath key={`route-${player.id}`} start={player.start} waypoints={player.task.route} ballYardLine={ballYardLine} selected={false} />
          ),
      )}
      {play.offense.players.map((player) => {
        const svg = playPointToSvg(player.start, ballYardLine);
        return (
          <PlayerToken
            key={player.id}
            id={player.id}
            position={player.position as Parameters<typeof PlayerToken>[0]["position"]}
            x={svg.x}
            y={svg.y}
            selected={false}
            onPointerDown={() => {}}
          />
        );
      })}
    </Field2D>
  );
}
