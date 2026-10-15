import { describe, expect, it } from "vitest";
import {
  FIELD_SVG_HEIGHT,
  PX_PER_YARD,
  crossFieldToSvgX,
  playPointToSvg,
  svgToPlayPoint,
  yardLineToSvgY,
} from "./coordinates";

describe("crossFieldToSvgX", () => {
  it("scales yards to pixels linearly", () => {
    expect(crossFieldToSvgX(0)).toBe(0);
    expect(crossFieldToSvgX(10)).toBe(10 * PX_PER_YARD);
  });
});

describe("yardLineToSvgY", () => {
  it("places the opponent's goal line (100) near the top of the SVG", () => {
    expect(yardLineToSvgY(100)).toBeCloseTo(10 * PX_PER_YARD);
  });

  it("places the own goal line (0) near the bottom of the SVG", () => {
    expect(yardLineToSvgY(0)).toBeCloseTo(FIELD_SVG_HEIGHT - 10 * PX_PER_YARD);
  });

  it("places midfield (50) in the vertical center", () => {
    expect(yardLineToSvgY(50)).toBeCloseTo(FIELD_SVG_HEIGHT / 2);
  });
});

describe("playPointToSvg / svgToPlayPoint", () => {
  it("round-trips a play-relative point through SVG space", () => {
    const original = { x: 24, y: 12 };
    const ballYardLine = 35;

    const svg = playPointToSvg(original, ballYardLine);
    const roundTripped = svgToPlayPoint(svg, ballYardLine);

    expect(roundTripped.x).toBeCloseTo(original.x);
    expect(roundTripped.y).toBeCloseTo(original.y);
  });

  it("moves a player downfield (positive y) toward smaller SVG-y", () => {
    const atLos = playPointToSvg({ x: 26, y: 0 }, 35);
    const downfield = playPointToSvg({ x: 26, y: 10 }, 35);

    expect(downfield.y).toBeLessThan(atLos.y);
  });
});
