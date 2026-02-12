import { useState, useCallback } from "react";
import type { Point } from "@/types/geometry";
import { useWallStore } from "@/stores/useWallStore";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { SNAP_THRESHOLD, GRID_SIZE } from "@/constants/canvas";
import { snapPointToGrid } from "@/utils/geometry";

type DrawingState = "idle" | "drawing";

export function useWallDrawing() {
  const [drawingState, setDrawingState] = useState<DrawingState>("idle");
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [previewEnd, setPreviewEnd] = useState<Point | null>(null);

  const { addNode, addSegment, findNodeNear, nodes } = useWallStore();
  const wallType = useCanvasStore((s) => s.wallType);

  const getActiveNode = useCallback((): Point | null => {
    if (!activeNodeId) return null;
    const node = useWallStore.getState().nodes[activeNodeId];
    return node ? { x: node.x, y: node.y } : null;
  }, [activeNodeId]);

  const handleClick = useCallback(
    (canvasPos: Point) => {
      const snapped = snapPointToGrid(canvasPos, GRID_SIZE);

      if (drawingState === "idle") {
        // Check for existing node to start from
        const existing = findNodeNear(snapped.x, snapped.y, SNAP_THRESHOLD);
        const nodeId = existing ? existing.id : addNode(snapped.x, snapped.y);
        setActiveNodeId(nodeId);
        setDrawingState("drawing");
        setPreviewEnd(snapped);
      } else {
        // Drawing state — place next node and create segment
        const existing = findNodeNear(snapped.x, snapped.y, SNAP_THRESHOLD);
        const newNodeId = existing
          ? existing.id
          : addNode(snapped.x, snapped.y);

        if (activeNodeId && newNodeId !== activeNodeId) {
          addSegment(activeNodeId, newNodeId, wallType);
        }

        setActiveNodeId(newNodeId);
        setPreviewEnd(snapped);
      }
    },
    [drawingState, activeNodeId, addNode, addSegment, findNodeNear, wallType]
  );

  const handleMouseMove = useCallback(
    (canvasPos: Point) => {
      if (drawingState === "drawing") {
        setPreviewEnd(snapPointToGrid(canvasPos, GRID_SIZE));
      }
    },
    [drawingState]
  );

  const handleDoubleClick = useCallback(() => {
    setDrawingState("idle");
    setActiveNodeId(null);
    setPreviewEnd(null);
  }, []);

  const cancel = useCallback(() => {
    setDrawingState("idle");
    setActiveNodeId(null);
    setPreviewEnd(null);
  }, []);

  return {
    drawingState,
    activeNodeId,
    previewEnd,
    getActiveNode,
    handleClick,
    handleMouseMove,
    handleDoubleClick,
    cancel,
  };
}
