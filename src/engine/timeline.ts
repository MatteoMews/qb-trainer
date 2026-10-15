import type { Point } from "../data/schemas";

export interface TimelineKeyframe {
  point: Point;
  t: number;
}

function distance(a: Point, b: Point): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * Baut einen Zeitstrahl aus Wegpunkten: konstante Geschwindigkeit pro Segment, mit einer
 * kurzen Pause an jedem inneren Wegpunkt (simuliert die Verzögerung eines Richtungswechsels/
 * Breaks, ohne echte Beschleunigungsphysik - "plausibel genug fürs Training", siehe
 * Projektauftrag Abschnitt 5.3).
 */
export function buildTimeline(start: Point, waypoints: readonly Point[], speedYdPerS: number, breakPauseS: number): TimelineKeyframe[] {
  const points = [start, ...waypoints];
  const timeline: TimelineKeyframe[] = [{ point: points[0], t: 0 }];
  let t = 0;

  for (let i = 1; i < points.length; i++) {
    t += distance(points[i - 1], points[i]) / speedYdPerS;
    timeline.push({ point: points[i], t });

    const isInteriorWaypoint = i < points.length - 1;
    if (isInteriorWaypoint && breakPauseS > 0) {
      t += breakPauseS;
      timeline.push({ point: points[i], t });
    }
  }

  return timeline;
}

/** Interpoliert die Position auf einem Zeitstrahl zum Zeitpunkt t (hält vor dem Start und nach
 *  dem Ende der Bewegung an). */
export function sampleTimeline(timeline: readonly TimelineKeyframe[], t: number): Point {
  const first = timeline[0];
  const last = timeline[timeline.length - 1];
  if (t <= first.t) return first.point;
  if (t >= last.t) return last.point;

  for (let i = 0; i < timeline.length - 1; i++) {
    const a = timeline[i];
    const b = timeline[i + 1];
    if (t >= a.t && t <= b.t) {
      const span = b.t - a.t;
      const frac = span === 0 ? 0 : (t - a.t) / span;
      return { x: a.point.x + (b.point.x - a.point.x) * frac, y: a.point.y + (b.point.y - a.point.y) * frac };
    }
  }
  return last.point;
}
