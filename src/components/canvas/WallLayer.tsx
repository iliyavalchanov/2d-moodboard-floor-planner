"use client";

import { Layer } from "react-konva";
import { useWallStore } from "@/stores/useWallStore";
import WallSegment from "./WallSegment";
import WallNode from "./WallNode";

export default function WallLayer() {
  const segments = useWallStore((s) => s.segments);
  const nodes = useWallStore((s) => s.nodes);

  return (
    <Layer>
      {Object.values(segments).map((seg) => (
        <WallSegment key={seg.id} segment={seg} />
      ))}
      {Object.values(nodes).map((node) => (
        <WallNode key={node.id} node={node} />
      ))}
    </Layer>
  );
}
