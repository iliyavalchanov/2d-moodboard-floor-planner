"use client";

import { useEffect, useRef } from "react";
import { Layer, Transformer, Rect } from "react-konva";
import type Konva from "konva";
import { useSelectionStore } from "@/stores/useSelectionStore";
import DrawingPreview from "./DrawingPreview";
import type { Point } from "@/types/geometry";

interface Props {
  previewStart: Point | null;
  previewEnd: Point | null;
  stageRef: React.RefObject<Konva.Stage | null>;
}

export default function InteractionLayer({
  previewStart,
  previewEnd,
  stageRef,
}: Props) {
  const trRef = useRef<Konva.Transformer>(null);
  const selectedItems = useSelectionStore((s) => s.selectedItems);

  useEffect(() => {
    if (!trRef.current || !stageRef.current) return;

    // Find Konva nodes matching selected IDs
    const stage = stageRef.current;
    const selectedNodes: Konva.Node[] = [];

    for (const item of selectedItems) {
      // Only transform moodboard items (images, text)
      if (item.type === "image" || item.type === "text") {
        const node = stage.findOne(`#${item.id}`);
        if (node) selectedNodes.push(node);
      }
    }

    trRef.current.nodes(selectedNodes);
    trRef.current.getLayer()?.batchDraw();
  }, [selectedItems, stageRef]);

  return (
    <Layer>
      <DrawingPreview start={previewStart} end={previewEnd} />
      <Transformer
        ref={trRef}
        boundBoxFunc={(oldBox, newBox) => {
          if (newBox.width < 20 || newBox.height < 20) return oldBox;
          return newBox;
        }}
      />
    </Layer>
  );
}
