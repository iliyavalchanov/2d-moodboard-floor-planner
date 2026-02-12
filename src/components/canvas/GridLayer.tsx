"use client";

import { useMemo } from "react";
import { Layer, Shape } from "react-konva";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { PIXELS_PER_METER } from "@/constants/canvas";
import { GRID_DOT_COLOR } from "@/constants/styles";

/** 1 cm in canvas pixels */
const BASE_GRID = PIXELS_PER_METER / 100; // 0.5px

/** Allowed grid steps as multiples of 1cm (in px) */
const STEPS = [1, 2, 5, 10, 25, 50, 100].map((cm) => cm * BASE_GRID);

/** Max dots to render per axis */
const MAX_PER_AXIS = 200;

export default function GridLayer() {
  const viewport = useCanvasStore((s) => s.viewport);
  const stageSize = useCanvasStore((s) => s.stageSize);

  const gridData = useMemo(() => {
    const { x, y, scale } = viewport;
    const { width, height } = stageSize;

    const left = -x / scale;
    const top = -y / scale;
    const right = (width - x) / scale;
    const bottom = (height - y) / scale;

    const viewW = right - left;
    const viewH = bottom - top;

    // Pick the smallest step that keeps dots under the limit
    let step = STEPS[STEPS.length - 1];
    for (const s of STEPS) {
      if (viewW / s <= MAX_PER_AXIS && viewH / s <= MAX_PER_AXIS) {
        step = s;
        break;
      }
    }

    const startX = Math.floor(left / step) * step;
    const startY = Math.floor(top / step) * step;
    const endX = Math.ceil(right / step) * step;
    const endY = Math.ceil(bottom / step) * step;

    // Dot radius scales: smaller dots for finer grids
    const dotRadius = Math.max(0.5, step * 0.12);

    return { startX, startY, endX, endY, step, dotRadius };
  }, [viewport, stageSize]);

  return (
    <Layer listening={false}>
      <Shape
        sceneFunc={(ctx, shape) => {
          const { startX, startY, endX, endY, step, dotRadius } = gridData;
          ctx.fillStyle = GRID_DOT_COLOR;
          for (let gx = startX; gx <= endX; gx += step) {
            for (let gy = startY; gy <= endY; gy += step) {
              ctx.beginPath();
              ctx.arc(gx, gy, dotRadius, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.fillStrokeShape(shape);
        }}
      />
    </Layer>
  );
}
