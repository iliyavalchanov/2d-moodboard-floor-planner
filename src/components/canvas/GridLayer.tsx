"use client";

import { useMemo } from "react";
import { Layer, Circle } from "react-konva";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { GRID_SIZE } from "@/constants/canvas";
import { GRID_DOT_COLOR, GRID_DOT_RADIUS } from "@/constants/styles";

export default function GridLayer() {
  const viewport = useCanvasStore((s) => s.viewport);
  const stageSize = useCanvasStore((s) => s.stageSize);

  const dots = useMemo(() => {
    const { x, y, scale } = viewport;
    const { width, height } = stageSize;

    // Visible canvas area in world coordinates
    const left = -x / scale;
    const top = -y / scale;
    const right = (width - x) / scale;
    const bottom = (height - y) / scale;

    // Snap to grid boundaries
    const startX = Math.floor(left / GRID_SIZE) * GRID_SIZE;
    const startY = Math.floor(top / GRID_SIZE) * GRID_SIZE;
    const endX = Math.ceil(right / GRID_SIZE) * GRID_SIZE;
    const endY = Math.ceil(bottom / GRID_SIZE) * GRID_SIZE;

    const result: { x: number; y: number }[] = [];

    // Skip rendering if too zoomed out (too many dots)
    if ((endX - startX) / GRID_SIZE > 200 || (endY - startY) / GRID_SIZE > 200) {
      return result;
    }

    for (let gx = startX; gx <= endX; gx += GRID_SIZE) {
      for (let gy = startY; gy <= endY; gy += GRID_SIZE) {
        result.push({ x: gx, y: gy });
      }
    }
    return result;
  }, [viewport, stageSize]);

  return (
    <Layer listening={false}>
      {dots.map((dot, i) => (
        <Circle
          key={i}
          x={dot.x}
          y={dot.y}
          radius={GRID_DOT_RADIUS}
          fill={GRID_DOT_COLOR}
        />
      ))}
    </Layer>
  );
}
