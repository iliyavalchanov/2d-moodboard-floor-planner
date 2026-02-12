"use client";

import { useState } from "react";
import { Group, Line, Rect, Text } from "react-konva";
import type { WallSegment as WallSegmentType } from "@/types/geometry";
import { useWallStore } from "@/stores/useWallStore";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { WALL_COLORS, WALL_THICKNESS, MEASUREMENT_BG_COLOR, MEASUREMENT_TEXT_COLOR, MEASUREMENT_FONT_SIZE } from "@/constants/styles";
import { midpoint, angle } from "@/utils/geometry";
import { formatLength } from "@/utils/measurements";

interface Props {
  segment: WallSegmentType;
}

export default function WallSegment({ segment }: Props) {
  const [hovered, setHovered] = useState(false);
  const startNode = useWallStore((s) => s.nodes[segment.startNodeId]);
  const endNode = useWallStore((s) => s.nodes[segment.endNodeId]);
  const isSelected = useSelectionStore((s) => s.isSelected(segment.id));
  const select = useSelectionStore((s) => s.select);

  if (!startNode || !endNode) return null;

  const color = WALL_COLORS[segment.wallType];
  const thickness = WALL_THICKNESS[segment.wallType];
  const mid = midpoint(startNode, endNode);
  const label = formatLength(startNode, endNode);
  const rotation = (angle(startNode, endNode) * 180) / Math.PI;

  return (
    <Group>
      <Line
        points={[startNode.x, startNode.y, endNode.x, endNode.y]}
        stroke={isSelected ? "#3B82F6" : color}
        strokeWidth={thickness}
        hitStrokeWidth={Math.max(thickness, 14)}
        onClick={(e) => {
          e.cancelBubble = true;
          select({ id: segment.id, type: "segment" });
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      />
      {(hovered || isSelected) && (
        <Group x={mid.x} y={mid.y} rotation={rotation}>
          <Rect
            x={-30}
            y={-22}
            width={60}
            height={18}
            fill={MEASUREMENT_BG_COLOR}
            cornerRadius={3}
          />
          <Text
            x={-30}
            y={-22}
            width={60}
            height={18}
            text={label}
            fill={MEASUREMENT_TEXT_COLOR}
            fontSize={MEASUREMENT_FONT_SIZE}
            align="center"
            verticalAlign="middle"
          />
        </Group>
      )}
    </Group>
  );
}
