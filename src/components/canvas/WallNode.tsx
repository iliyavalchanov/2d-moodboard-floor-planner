"use client";

import { Circle } from "react-konva";
import type { WallNode as WallNodeType } from "@/types/geometry";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useWallStore } from "@/stores/useWallStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { ToolMode } from "@/types/canvas";
import { NODE_RADIUS, NODE_COLOR, NODE_ACTIVE_COLOR } from "@/constants/styles";
import { GRID_SIZE } from "@/constants/canvas";
import { snapToGrid } from "@/utils/geometry";

interface Props {
  node: WallNodeType;
}

export default function WallNode({ node }: Props) {
  const isSelected = useSelectionStore((s) => s.isSelected(node.id));
  const select = useSelectionStore((s) => s.select);
  const moveNode = useWallStore((s) => s.moveNode);

  return (
    <Circle
      x={node.x}
      y={node.y}
      radius={NODE_RADIUS}
      fill={isSelected ? NODE_ACTIVE_COLOR : NODE_COLOR}
      draggable
      onDragStart={() => {
        useHistoryStore.getState().push();
      }}
      onClick={(e) => {
        const mode = useCanvasStore.getState().toolMode;
        if (mode === ToolMode.Select) {
          e.cancelBubble = true;
          select({ id: node.id, type: "node" });
        }
      }}
      onDragMove={(e) => {
        const x = snapToGrid(e.target.x(), GRID_SIZE);
        const y = snapToGrid(e.target.y(), GRID_SIZE);
        e.target.x(x);
        e.target.y(y);
        moveNode(node.id, x, y);
      }}
      hitStrokeWidth={10}
    />
  );
}
