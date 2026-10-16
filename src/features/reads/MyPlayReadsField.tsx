import { Field2D } from "../../components/Field2D";
import type { Play } from "../../data/playSchema";
import type { Defense } from "../../data/defenseSchema";
import { playPointToSvg } from "../../engine/coordinates";
import { PlayerToken } from "../editor/PlayerToken";
import { RoutePath } from "../editor/RoutePath";
import { DefenderToken } from "../defense/DefenderToken";
import "./ReadsField.css";

export interface MyPlayReadsFieldProps {
  play: Play;
  defense?: Defense;
  keyDefenderId?: string;
  onDefenderClick?: (defenderId: string) => void;
}

/** Wie ReadsField, aber für einen echten gespeicherten Spielzug (eigenes Playbook statt
 *  Formation+Konzept-Bibliothek): rendert Routen/Spieler direkt aus den Play-Daten (wie
 *  PlayPreviewField) und Verteidiger direkt aus der Defense-Daten (wie DefensePreviewField),
 *  plus anklickbare Verteidiger zum Markieren des Schlüssel-Reads. */
export function MyPlayReadsField({ play, defense, keyDefenderId, onDefenderClick }: MyPlayReadsFieldProps) {
  const ballYardLine = play.ball.yardLine;

  return (
    <div className="reads-field">
      <Field2D>
        {play.offense.players.map(
          (player) =>
            player.task.type === "route" && (
              <RoutePath key={`route-${player.id}`} start={player.start} waypoints={player.task.route} ballYardLine={ballYardLine} selected={false} />
            ),
        )}

        {defense?.players.map((defender) => {
          const svg = playPointToSvg(defender.start, ballYardLine);
          return (
            <DefenderToken
              key={defender.id}
              id={defender.id}
              position={defender.position as Parameters<typeof DefenderToken>[0]["position"]}
              x={svg.x}
              y={svg.y}
              selected={defender.id === keyDefenderId}
              onPointerDown={() => onDefenderClick?.(defender.id)}
            />
          );
        })}

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
    </div>
  );
}
