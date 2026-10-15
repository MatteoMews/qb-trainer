import { forwardRef, type PointerEventHandler, type ReactNode } from "react";
import {
  END_ZONE_DEPTH_YD,
  FIELD_WIDTH_YD,
  HASH_FROM_SIDELINE_YD,
  YARD_NUMBER_LINES,
} from "../data/field";
import { crossFieldToSvgX, FIELD_SVG_HEIGHT, FIELD_SVG_WIDTH, yardLineToSvgY } from "../engine/coordinates";
import "./Field2D.css";

const HASH_TICK_WIDTH_YD = 1;

export interface Field2DProps {
  /** Overlay-Inhalt (Spieler, Routen), im selben Koordinatensystem wie das Feld gerendert. */
  children?: ReactNode;
  onPointerDown?: PointerEventHandler<SVGSVGElement>;
  onPointerMove?: PointerEventHandler<SVGSVGElement>;
  onPointerUp?: PointerEventHandler<SVGSVGElement>;
}

/** NCAA-Football-Feld in Vogelperspektive (Offense unten, Richtung Verteidigung = nach oben).
 *  Nimmt optional Overlay-Children (Spieler/Routen) entgegen und leitet Pointer-Events weiter,
 *  damit der Editor Drag&Drop über dem Feld umsetzen kann. */
export const Field2D = forwardRef<SVGSVGElement, Field2DProps>(function Field2D(
  { children, onPointerDown, onPointerMove, onPointerUp },
  ref,
) {
  const yardLines = Array.from({ length: 101 }, (_, yardLine) => yardLine);
  const leftHashX = crossFieldToSvgX(HASH_FROM_SIDELINE_YD);
  const rightHashX = crossFieldToSvgX(FIELD_WIDTH_YD - HASH_FROM_SIDELINE_YD);
  const ownGoalLineY = yardLineToSvgY(0);
  const opponentGoalLineY = yardLineToSvgY(100);

  return (
    <svg
      ref={ref}
      className="field-2d"
      viewBox={`0 0 ${FIELD_SVG_WIDTH} ${FIELD_SVG_HEIGHT}`}
      role="img"
      aria-label="American-Football-Feld, NCAA-Maße, Vogelperspektive"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <rect x={0} y={0} width={FIELD_SVG_WIDTH} height={FIELD_SVG_HEIGHT} className="field-2d__turf" />

      <rect
        x={0}
        y={opponentGoalLineY - END_ZONE_DEPTH_YD * 10}
        width={FIELD_SVG_WIDTH}
        height={END_ZONE_DEPTH_YD * 10}
        className="field-2d__endzone"
      />
      <rect x={0} y={ownGoalLineY} width={FIELD_SVG_WIDTH} height={END_ZONE_DEPTH_YD * 10} className="field-2d__endzone" />

      {yardLines
        .filter((yardLine) => yardLine % 5 === 0)
        .map((yardLine) => (
          <line
            key={`yard-line-${yardLine}`}
            x1={0}
            x2={FIELD_SVG_WIDTH}
            y1={yardLineToSvgY(yardLine)}
            y2={yardLineToSvgY(yardLine)}
            className={yardLine % 10 === 0 ? "field-2d__line field-2d__line--major" : "field-2d__line"}
          />
        ))}

      {yardLines.map((yardLine) => (
        <g key={`hash-${yardLine}`}>
          <line
            x1={leftHashX - (HASH_TICK_WIDTH_YD * 10) / 2}
            x2={leftHashX + (HASH_TICK_WIDTH_YD * 10) / 2}
            y1={yardLineToSvgY(yardLine)}
            y2={yardLineToSvgY(yardLine)}
            className="field-2d__hash"
          />
          <line
            x1={rightHashX - (HASH_TICK_WIDTH_YD * 10) / 2}
            x2={rightHashX + (HASH_TICK_WIDTH_YD * 10) / 2}
            y1={yardLineToSvgY(yardLine)}
            y2={yardLineToSvgY(yardLine)}
            className="field-2d__hash"
          />
        </g>
      ))}

      {YARD_NUMBER_LINES.map((yardLine) => {
        const label = yardLine <= 50 ? yardLine : 100 - yardLine;
        const y = yardLineToSvgY(yardLine);
        return (
          <g key={`number-${yardLine}`}>
            <text x={crossFieldToSvgX(12)} y={y} className="field-2d__number">
              {label}
            </text>
            <text x={crossFieldToSvgX(FIELD_WIDTH_YD - 12)} y={y} className="field-2d__number">
              {label}
            </text>
          </g>
        );
      })}

      <rect x={0} y={0} width={FIELD_SVG_WIDTH} height={FIELD_SVG_HEIGHT} className="field-2d__boundary" />

      {children}
    </svg>
  );
});
