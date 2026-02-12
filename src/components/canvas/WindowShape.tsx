"use client";

import { Group, Rect } from "react-konva";
import type { Window } from "@/types/fixtures";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { WINDOW_DEPTH, WINDOW_COLOR, WINDOW_GLASS_COLOR } from "@/constants/styles";

interface Props {
  window: Window;
}

export default function WindowShape({ window: win }: Props) {
  const isSelected = useSelectionStore((s) => s.isSelected(win.id));
  const select = useSelectionStore((s) => s.select);

  return (
    <Group
      x={win.x}
      y={win.y}
      rotation={win.rotation}
      onClick={(e) => {
        e.cancelBubble = true;
        select({ id: win.id, type: "window" });
      }}
    >
      {/* Window frame */}
      <Rect
        x={-win.width / 2}
        y={-WINDOW_DEPTH / 2}
        width={win.width}
        height={WINDOW_DEPTH}
        stroke={isSelected ? "#22D3EE" : WINDOW_COLOR}
        strokeWidth={2}
        fill={WINDOW_GLASS_COLOR}
      />
      {/* Center line (glass panes) */}
      <Rect
        x={-win.width / 2}
        y={-0.5}
        width={win.width}
        height={1}
        fill={WINDOW_COLOR}
      />
    </Group>
  );
}
