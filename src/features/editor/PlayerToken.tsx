import type { PointerEventHandler } from "react";
import type { OffensePosition } from "../../data/positions";

export interface PlayerTokenProps {
  id: string;
  position: OffensePosition;
  x: number;
  y: number;
  selected: boolean;
  onPointerDown: PointerEventHandler<SVGGElement>;
}

/** Ein verschiebbarer Spieler-Marker im Feld: Kreis mit Alignment-Label (id). */
export function PlayerToken({ id, position, x, y, selected, onPointerDown }: PlayerTokenProps) {
  const isLineman = position === "LT" || position === "LG" || position === "C" || position === "RG" || position === "RT";

  return (
    <g
      className="player-token"
      transform={`translate(${x}, ${y})`}
      onPointerDown={onPointerDown}
      role="button"
      aria-label={`Spieler ${id}`}
      tabIndex={0}
    >
      {isLineman ? (
        <rect x={-6} y={-6} width={12} height={12} className={selected ? "player-token__shape player-token__shape--selected" : "player-token__shape"} />
      ) : (
        <circle r={7} className={selected ? "player-token__shape player-token__shape--selected" : "player-token__shape"} />
      )}
      <text className="player-token__label" textAnchor="middle" dominantBaseline="middle">
        {id}
      </text>
    </g>
  );
}
