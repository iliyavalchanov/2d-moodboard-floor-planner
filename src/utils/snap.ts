import type { Point, WallNode, WallSegment } from "@/types/geometry";
import { projectPointOnSegment, angle } from "./geometry";

export interface WallSnapResult {
  wallSegmentId: string;
  wallParameter: number;
  snappedPosition: Point;
  rotation: number;
  distance: number;
}

/**
 * Snap a point to the nearest wall segment.
 * Returns null if no wall is within the threshold.
 */
export function snapToWall(
  point: Point,
  segments: Record<string, WallSegment>,
  nodes: Record<string, WallNode>,
  threshold: number
): WallSnapResult | null {
  let best: WallSnapResult | null = null;

  for (const seg of Object.values(segments)) {
    const start = nodes[seg.startNodeId];
    const end = nodes[seg.endNodeId];
    if (!start || !end) continue;

    const { t, projected, distance: dist } = projectPointOnSegment(
      point,
      start,
      end
    );

    if (dist <= threshold && (!best || dist < best.distance)) {
      best = {
        wallSegmentId: seg.id,
        wallParameter: t,
        snappedPosition: projected,
        rotation: (angle(start, end) * 180) / Math.PI,
        distance: dist,
      };
    }
  }

  return best;
}
