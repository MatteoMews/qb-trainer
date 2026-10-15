import { END_ZONE_DEPTH_YD, FIELD_LENGTH_YD, FIELD_WIDTH_YD, type Yards } from "../data/field";
import type { Point } from "../data/schemas";

/** Pixel pro Yard für die SVG-Darstellung des 2D-Felds. */
export const PX_PER_YARD = 10;

export interface SvgPoint {
  x: number;
  y: number;
}

/** Feldmaße in SVG-Pixeln (für viewBox). Das Feld wird vertikal dargestellt:
 *  die eigene Endzone unten, die gegnerische oben. */
export const FIELD_SVG_WIDTH = FIELD_WIDTH_YD * PX_PER_YARD;
export const FIELD_SVG_HEIGHT = FIELD_LENGTH_YD * PX_PER_YARD;

/** Wandelt eine Cross-Field-x-Position (0..FIELD_WIDTH_YD) in SVG-x um. */
export function crossFieldToSvgX(x: Yards): number {
  return x * PX_PER_YARD;
}

/** Wandelt eine Yard-Linie (0 = eigene Torlinie, 100 = gegnerische Torlinie) in SVG-y um.
 *  Die gegnerische Endzone liegt oben (kleineres y), die eigene unten. */
export function yardLineToSvgY(yardLine: Yards): number {
  return FIELD_SVG_HEIGHT - (yardLine + END_ZONE_DEPTH_YD) * PX_PER_YARD;
}

/** Umkehrfunktion zu crossFieldToSvgX. */
export function svgXToCrossField(svgX: number): Yards {
  return svgX / PX_PER_YARD;
}

/** Umkehrfunktion zu yardLineToSvgY. */
export function svgYToYardLine(svgY: number): Yards {
  return (FIELD_SVG_HEIGHT - svgY) / PX_PER_YARD - END_ZONE_DEPTH_YD;
}

/** Wandelt einen Play-relativen Punkt (x = cross-field, y = Abstand zur LOS) in SVG-Koordinaten
 *  um, gegeben die absolute Yard-Linie des Balls. */
export function playPointToSvg(point: Point, ballYardLine: Yards): SvgPoint {
  return {
    x: crossFieldToSvgX(point.x),
    y: yardLineToSvgY(ballYardLine + point.y),
  };
}

/** Umkehrfunktion zu playPointToSvg: wandelt eine SVG-Position zurück in einen Play-relativen Punkt. */
export function svgToPlayPoint(svgPoint: SvgPoint, ballYardLine: Yards): Point {
  return {
    x: svgXToCrossField(svgPoint.x),
    y: svgYToYardLine(svgPoint.y) - ballYardLine,
  };
}
