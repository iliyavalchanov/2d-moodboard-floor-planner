"use client";

import { Line, Group, Rect, Text } from "react-konva";
import type { Point } from "@/types/geometry";
import { PREVIEW_LINE_COLOR, PREVIEW_LINE_DASH, MEASUREMENT_BG_COLOR, MEASUREMENT_TEXT_COLOR } from "@/constants/styles";
import { distance, midpoint, angle } from "@/utils/geometry";
import { PIXELS_PER_METER } from "@/constants/canvas";

interface Props {
  start: Point | null;
  end: Point | null;
}

export default function DrawingPreview({ start, end }: Props) {
  if (!start || !end) return null;

  const dist = distance(start, end);
  if (dist < 1) return null;

  const cm = Math.round((dist / PIXELS_PER_METER) * 100);
  const label = cm >= 100 ? `${(cm / 100).toFixed(2)} m` : `${cm} cm`;

  const mid = midpoint(start, end);
  let rot = (angle(start, end) * 180) / Math.PI;
  // Keep text readable (not upside down)
  if (rot > 90 || rot < -90) rot += 180;

  const labelWidth = Math.max(label.length * 8, 50);

  return (
    <Group listening={false}>
      <Line
        points={[start.x, start.y, end.x, end.y]}
        stroke={PREVIEW_LINE_COLOR}
        strokeWidth={2}
        dash={PREVIEW_LINE_DASH}
      />
      <Group x={mid.x} y={mid.y} rotation={rot}>
        <Rect
          x={-labelWidth / 2}
          y={-24}
          width={labelWidth}
          height={18}
          fill={MEASUREMENT_BG_COLOR}
          cornerRadius={3}
          opacity={0.85}
        />
        <Text
          x={-labelWidth / 2}
          y={-24}
          width={labelWidth}
          height={18}
          text={label}
          fill={MEASUREMENT_TEXT_COLOR}
          fontSize={12}
          fontFamily="monospace"
          align="center"
          verticalAlign="middle"
        />
      </Group>
    </Group>
  );
}
