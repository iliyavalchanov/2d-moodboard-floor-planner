import type { Point } from "@/types/geometry";

/** Euclidean distance between two points */
export function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

/** Midpoint between two points */
export function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Angle in radians from point a to point b */
export function angle(a: Point, b: Point): number {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

/**
 * Project point P onto line segment AB.
 * Returns the parameter t (0–1 if projection is on the segment)
 * and the projected point.
 */
export function projectPointOnSegment(
  p: Point,
  a: Point,
  b: Point
): { t: number; projected: Point; distance: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    return { t: 0, projected: { ...a }, distance: distance(p, a) };
  }

  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projected: Point = {
    x: a.x + t * dx,
    y: a.y + t * dy,
  };

  return { t, projected, distance: distance(p, projected) };
}

/** Snap a value to the nearest grid increment */
export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

/** Snap a point to the nearest grid position */
export function snapPointToGrid(point: Point, gridSize: number): Point {
  return {
    x: snapToGrid(point.x, gridSize),
    y: snapToGrid(point.y, gridSize),
  };
}
