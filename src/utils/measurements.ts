import { PIXELS_PER_METER } from "@/constants/canvas";
import type { Point } from "@/types/geometry";
import { distance } from "./geometry";

/** Convert pixel distance to meters */
export function pixelsToMeters(px: number): number {
  return px / PIXELS_PER_METER;
}

/** Format a pixel distance as a human-readable meter string */
export function formatLength(a: Point, b: Point): string {
  const meters = pixelsToMeters(distance(a, b));
  return `${meters.toFixed(2)} m`;
}
