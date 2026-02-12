"use client";

import { Line } from "react-konva";
import type { Point } from "@/types/geometry";
import { PREVIEW_LINE_COLOR, PREVIEW_LINE_DASH } from "@/constants/styles";

interface Props {
  start: Point | null;
  end: Point | null;
}

export default function DrawingPreview({ start, end }: Props) {
  if (!start || !end) return null;

  return (
    <Line
      points={[start.x, start.y, end.x, end.y]}
      stroke={PREVIEW_LINE_COLOR}
      strokeWidth={2}
      dash={PREVIEW_LINE_DASH}
      listening={false}
    />
  );
}
