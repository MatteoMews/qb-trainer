import type { RefObject } from "react";
import type { SvgPoint } from "../../engine/coordinates";

/** Wandelt Client-Koordinaten (clientX/clientY eines PointerEvents) in das Koordinatensystem
 *  der SVG-viewBox um, unabhängig von der tatsächlichen Render-Größe des Elements. */
export function clientToSvgPoint(svgRef: RefObject<SVGSVGElement | null>, clientX: number, clientY: number): SvgPoint | null {
  const svg = svgRef.current;
  if (!svg) return null;
  const ctm = svg.getScreenCTM();
  if (!ctm) return null;
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const transformed = point.matrixTransform(ctm.inverse());
  return { x: transformed.x, y: transformed.y };
}
