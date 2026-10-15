import { playPointToSvg } from "../../engine/coordinates";
import type { Point } from "../../data/schemas";

export interface RoutePathProps {
  start: Point;
  waypoints: Point[];
  ballYardLine: number;
  selected: boolean;
}

/** Zeichnet eine Route als Linienzug vom Spieler-Start durch alle Wegpunkte, mit Pfeilspitze am Ende. */
export function RoutePath({ start, waypoints, ballYardLine, selected }: RoutePathProps) {
  if (waypoints.length === 0) return null;

  const points = [start, ...waypoints].map((point) => playPointToSvg(point, ballYardLine));
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const last = points.at(-1)!;
  const secondLast = points.at(-2) ?? points[0];
  const angle = Math.atan2(last.y - secondLast.y, last.x - secondLast.x);
  const arrowSize = 6;

  return (
    <g className={selected ? "route-path route-path--selected" : "route-path"}>
      <path d={d} fill="none" className="route-path__line" />
      <polygon
        points={`0,-${arrowSize / 2} ${arrowSize},0 0,${arrowSize / 2}`}
        transform={`translate(${last.x}, ${last.y}) rotate(${(angle * 180) / Math.PI})`}
        className="route-path__arrow"
      />
    </g>
  );
}
