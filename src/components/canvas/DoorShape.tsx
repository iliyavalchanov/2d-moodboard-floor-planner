"use client";

import { Group, Rect, Arc } from "react-konva";
import type { Door } from "@/types/fixtures";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { useFixtureStore } from "@/stores/useFixtureStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { DOOR_DEPTH, DOOR_COLOR } from "@/constants/styles";

interface Props {
  door: Door;
}

export default function DoorShape({ door }: Props) {
  const isSelected = useSelectionStore((s) => s.isSelected(door.id));
  const select = useSelectionStore((s) => s.select);

  const flipped = door.flipped ?? false;
  const scaleY = flipped ? -1 : 1;

  return (
    <Group
      x={door.x}
      y={door.y}
      rotation={door.rotation}
      scaleY={scaleY}
      onClick={(e) => {
        e.cancelBubble = true;
        select({ id: door.id, type: "door" });
      }}
      onDblClick={(e) => {
        e.cancelBubble = true;
        useHistoryStore.getState().push();
        useFixtureStore.getState().updateDoor(door.id, { flipped: !flipped });
      }}
    >
      {/* Door panel */}
      <Rect
        x={-door.width / 2}
        y={-DOOR_DEPTH / 2}
        width={door.width}
        height={DOOR_DEPTH}
        fill={isSelected ? "#A78BFA" : DOOR_COLOR}
      />
      {/* Swing arc */}
      <Arc
        x={-door.width / 2}
        y={0}
        innerRadius={0}
        outerRadius={door.width}
        angle={90}
        rotation={-90}
        fill="rgba(139,92,246,0.15)"
        stroke={DOOR_COLOR}
        strokeWidth={1}
        dash={[4, 4]}
      />
    </Group>
  );
}
