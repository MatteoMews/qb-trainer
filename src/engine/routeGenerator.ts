import { clampCrossField, type Yards } from "../data/field";
import type { Point } from "../data/schemas";
import { ROUTE_TREE, type BreakDirection, type RouteName } from "../data/routeTree";

export type FieldSide = "left" | "right";

export interface RouteContext {
  /** Cross-field x-Position (0..FIELD_WIDTH_YD), an der der Receiver releast. */
  startX: Yards;
  /** Seite des Feldes, auf der der Receiver relativ zur Formationsmitte steht. Bestimmt die Break-Richtung. */
  side: FieldSide;
  /** Überschreibt die Default-Tiefe aus dem Route-Tree (z.B. für individuell angepasste Breaks). */
  depthYd?: Yards;
}

interface RouteStep {
  /** Absolute Downfield-Distanz zur Line of Scrimmage (kann für Comeback/Settle-Routes kleiner werden als der vorige Wert). */
  yAbs: Yards;
  /** Laterale Distanz zur Start-x-Position, immer positiv; Richtung über `direction` aufgelöst. */
  xOffsetYd: Yards;
  direction?: BreakDirection;
}

/**
 * Wegpunkt-"Rezepte" pro Route, relativ zur Release-Position des Receivers.
 *
 * // TODO(Football-Check): Breite und Tiefe der Breaks sind Richtwerte für ein plausibles,
 * // generisches Trainingsbild. Sie ersetzen keine exakten Coaching-Points eines bestimmten
 * // Playbooks und sollten von dir fachlich geprüft werden.
 */
const ROUTE_RECIPES: Record<RouteName, readonly RouteStep[]> = {
  Flat: [
    { yAbs: 1, xOffsetYd: 0 },
    { yAbs: 2, xOffsetYd: 6, direction: "sideline" },
  ],
  Slant: [
    { yAbs: 2, xOffsetYd: 0 },
    { yAbs: 4, xOffsetYd: 5, direction: "ball" },
  ],
  Comeback: [
    { yAbs: 14, xOffsetYd: 0 },
    { yAbs: 11, xOffsetYd: 4, direction: "sideline" },
  ],
  Curl: [
    { yAbs: 11, xOffsetYd: 0 },
    { yAbs: 9, xOffsetYd: 1, direction: "ball" },
  ],
  Hitch: [
    { yAbs: 5, xOffsetYd: 0 },
    { yAbs: 4, xOffsetYd: 1, direction: "ball" },
  ],
  Out: [
    { yAbs: 10, xOffsetYd: 0 },
    { yAbs: 10, xOffsetYd: 8, direction: "sideline" },
  ],
  Dig: [
    { yAbs: 13, xOffsetYd: 0 },
    { yAbs: 13, xOffsetYd: 10, direction: "ball" },
  ],
  Corner: [
    { yAbs: 11, xOffsetYd: 0 },
    { yAbs: 16, xOffsetYd: 8, direction: "sideline" },
  ],
  Post: [
    { yAbs: 11, xOffsetYd: 0 },
    { yAbs: 17, xOffsetYd: 8, direction: "ball" },
  ],
  Go: [
    { yAbs: 12, xOffsetYd: 0 },
    { yAbs: 22, xOffsetYd: 2, direction: "sideline" },
  ],
  Seam: [
    { yAbs: 12, xOffsetYd: 0 },
    { yAbs: 22, xOffsetYd: 0 },
  ],
  Whip: [
    { yAbs: 3, xOffsetYd: 3, direction: "sideline" },
    { yAbs: 6, xOffsetYd: 4, direction: "ball" },
  ],
  Option: [
    { yAbs: 6, xOffsetYd: 0 },
    { yAbs: 5, xOffsetYd: 1, direction: "ball" },
  ],
  Choice: [
    { yAbs: 8, xOffsetYd: 0 },
    { yAbs: 7, xOffsetYd: 1, direction: "ball" },
  ],
  Wheel: [
    { yAbs: 2, xOffsetYd: 6, direction: "sideline" },
    { yAbs: 18, xOffsetYd: 8, direction: "sideline" },
  ],
  Shallow: [
    { yAbs: 2, xOffsetYd: 0 },
    { yAbs: 3, xOffsetYd: 15, direction: "ball" },
  ],
  Sit: [
    { yAbs: 6, xOffsetYd: 0 },
    { yAbs: 6, xOffsetYd: 1, direction: "ball" },
  ],
  Angle: [
    { yAbs: 2, xOffsetYd: 3, direction: "sideline" },
    { yAbs: 5, xOffsetYd: 5, direction: "ball" },
  ],
  Texas: [
    { yAbs: 3, xOffsetYd: 3, direction: "sideline" },
    { yAbs: 8, xOffsetYd: 6, direction: "ball" },
  ],
  Swing: [
    { yAbs: 0.5, xOffsetYd: 4, direction: "sideline" },
    { yAbs: 1, xOffsetYd: 8, direction: "sideline" },
  ],
};

function lateralSign(direction: BreakDirection | undefined, side: FieldSide): number {
  if (!direction || direction === "none") return 0;
  const towardSideline = direction === "sideline" || direction === "upfield-sideline";
  const towardBall = direction === "ball" || direction === "upfield-ball" || direction === "varies";
  if (towardSideline) return side === "right" ? 1 : -1;
  if (towardBall) return side === "right" ? -1 : 1;
  return 0;
}

/** Erzeugt die Wegpunkte einer Route (ohne Startpunkt) im Play-Koordinatensystem.
 *  `depthYd` aus dem Kontext skaliert das Rezept proportional zur Default-Tiefe des Route-Trees. */
export function generateRoute(routeName: RouteName, context: RouteContext): Point[] {
  const entry = ROUTE_TREE.find((route) => route.name === routeName);
  const recipe = ROUTE_RECIPES[routeName];
  if (!entry || !recipe) {
    throw new Error(`Unbekannte Route: ${routeName}`);
  }

  const scale = context.depthYd !== undefined ? context.depthYd / entry.defaultDepthYd : 1;

  return recipe.map((step) => {
    const sign = lateralSign(step.direction ?? entry.breaksToward, context.side);
    return {
      x: clampCrossField(context.startX + sign * step.xOffsetYd),
      y: step.yAbs * scale,
    };
  });
}
