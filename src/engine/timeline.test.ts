import { describe, expect, it } from "vitest";
import { buildTimeline, sampleTimeline } from "./timeline";

describe("buildTimeline / sampleTimeline", () => {
  it("starts at the start point at t=0", () => {
    const timeline = buildTimeline({ x: 0, y: 0 }, [{ x: 0, y: 10 }], 10, 0.1);
    expect(sampleTimeline(timeline, 0)).toEqual({ x: 0, y: 0 });
  });

  it("reaches the final waypoint after enough time has passed", () => {
    const timeline = buildTimeline({ x: 0, y: 0 }, [{ x: 0, y: 10 }], 10, 0.1);
    expect(sampleTimeline(timeline, 100)).toEqual({ x: 0, y: 10 });
  });

  it("moves at the given speed along a straight single-segment path", () => {
    const timeline = buildTimeline({ x: 0, y: 0 }, [{ x: 0, y: 10 }], 10, 0.1);
    // 10 yd at 10 yd/s = 1s to arrive; halfway there at 0.5s
    const halfway = sampleTimeline(timeline, 0.5);
    expect(halfway.y).toBeCloseTo(5);
  });

  it("pauses at an interior waypoint for the break penalty", () => {
    const timeline = buildTimeline(
      { x: 0, y: 0 },
      [
        { x: 0, y: 10 }, // interior waypoint - arrival at t=1s with speed 10
        { x: 10, y: 10 },
      ],
      10,
      0.5,
    );
    // Arrival at (0,10) at t=1. Pause until t=1.5. Position during the pause should stay put.
    expect(sampleTimeline(timeline, 1.0)).toEqual({ x: 0, y: 10 });
    expect(sampleTimeline(timeline, 1.25)).toEqual({ x: 0, y: 10 });
    expect(sampleTimeline(timeline, 1.5)).toEqual({ x: 0, y: 10 });
    // After the pause, movement resumes toward the next point.
    const afterPause = sampleTimeline(timeline, 2.0); // 0.5s into a 1s segment -> halfway
    expect(afterPause.x).toBeCloseTo(5);
  });

  it("never pauses at the very last waypoint", () => {
    const timeline = buildTimeline({ x: 0, y: 0 }, [{ x: 0, y: 10 }], 10, 0.5);
    // Only one segment -> no interior waypoints -> total duration should be exactly 1s.
    expect(timeline[timeline.length - 1].t).toBeCloseTo(1);
  });
});
