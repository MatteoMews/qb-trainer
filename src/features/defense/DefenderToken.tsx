import type { PointerEventHandler } from "react";
import type { DefensePosition } from "../../data/positions";

export interface DefenderTokenProps {
  id: string;
  position: DefensePosition;
  x: number;
  y: number;
  selected: boolean;
  onPointerDown: PointerEventHandler<SVGGElement>;
}

const DL_POSITIONS = new Set<DefensePosition>(["DE", "DT", "NT"]);
const LB_POSITIONS = new Set<DefensePosition>(["OLB", "MLB", "ILB"]);

/** Ein verschiebbarer Defender-Marker. Form zeigt die Positionsgruppe: Quadrat = DL,
 *  Dreieck = LB, Kreis = Secondary (CB/S/NB) - unterscheidet sich klar von den Offense-Markern. */
export function DefenderToken({ id, position, x, y, selected, onPointerDown }: DefenderTokenProps) {
  const shapeClass = selected ? "defender-token__shape defender-token__shape--selected" : "defender-token__shape";

  return (
    <g
      className="defender-token"
      transform={`translate(${x}, ${y})`}
      onPointerDown={onPointerDown}
      role="button"
      aria-label={`Defender ${id}`}
      tabIndex={0}
    >
      {DL_POSITIONS.has(position) && <rect x={-6} y={-6} width={12} height={12} className={shapeClass} />}
      {LB_POSITIONS.has(position) && <polygon points="0,-8 7,6 -7,6" className={shapeClass} />}
      {!DL_POSITIONS.has(position) && !LB_POSITIONS.has(position) && <circle r={7} className={shapeClass} />}
      <text className="defender-token__label" textAnchor="middle" dominantBaseline="middle">
        {id}
      </text>
    </g>
  );
}
