import { Field2D } from "../../components/Field2D";
import type { Defense } from "../../data/defenseSchema";
import { playPointToSvg } from "../../engine/coordinates";
import { DefenderToken } from "./DefenderToken";

const DISPLAY_YARD_LINE = 50;

export interface DefensePreviewFieldProps {
  defense: Defense;
}

/** Rendert eine Defense direkt aus ihren gespeicherten Spieler-Daten (ohne Front/Coverage neu
 *  aufzulösen) - für die Import-Vorschau, bei der die Defense aus beliebigem JSON stammen kann. */
export function DefensePreviewField({ defense }: DefensePreviewFieldProps) {
  return (
    <Field2D>
      {defense.players.map((player) => {
        const svg = playPointToSvg(player.start, DISPLAY_YARD_LINE);
        return (
          <DefenderToken
            key={player.id}
            id={player.id}
            position={player.position as Parameters<typeof DefenderToken>[0]["position"]}
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
