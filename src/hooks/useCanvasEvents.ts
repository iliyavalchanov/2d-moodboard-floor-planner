import { useCallback } from "react";
import type Konva from "konva";
import { ToolMode } from "@/types/canvas";
import type { Point } from "@/types/geometry";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { useMoodboardStore } from "@/stores/useMoodboardStore";
import { useFixtureStore } from "@/stores/useFixtureStore";
import { useWallStore } from "@/stores/useWallStore";
import { useHistoryStore } from "@/stores/useHistoryStore";
import { snapToWall } from "@/utils/snap";
import { WALL_SNAP_THRESHOLD } from "@/constants/canvas";

interface CanvasEventsConfig {
  wallDrawing: {
    handleClick: (pos: Point) => void;
    handleMouseMove: (pos: Point) => void;
    handleDoubleClick: () => void;
  };
  setImageModalOpen: (open: boolean) => void;
}

/** Convert stage pointer to canvas coordinates */
function getCanvasPos(stage: Konva.Stage): Point | null {
  const pointer = stage.getPointerPosition();
  if (!pointer) return null;
  const scale = stage.scaleX();
  return {
    x: (pointer.x - stage.x()) / scale,
    y: (pointer.y - stage.y()) / scale,
  };
}

export function useCanvasEvents(config: CanvasEventsConfig) {
  const toolMode = useCanvasStore((s) => s.toolMode);
  const setCursorPosition = useCanvasStore((s) => s.setCursorPosition);
  const clearSelection = useSelectionStore((s) => s.clearSelection);

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;
      const pos = getCanvasPos(stage);
      if (!pos) return;

      // If clicking on the stage background itself (not a shape)
      const clickedOnEmpty = e.target === stage;

      switch (toolMode) {
        case ToolMode.Select:
          if (clickedOnEmpty) clearSelection();
          break;

        case ToolMode.DrawWall:
          useHistoryStore.getState().push();
          config.wallDrawing.handleClick(pos);
          break;

        case ToolMode.PlaceDoor: {
          const { segments, nodes } = useWallStore.getState();
          const snap = snapToWall(pos, segments, nodes, WALL_SNAP_THRESHOLD);
          if (snap) {
            useHistoryStore.getState().push();
            useFixtureStore
              .getState()
              .addDoor(
                snap.wallSegmentId,
                snap.wallParameter,
                snap.snappedPosition.x,
                snap.snappedPosition.y,
                snap.rotation
              );
          }
          break;
        }

        case ToolMode.PlaceWindow: {
          const { segments, nodes } = useWallStore.getState();
          const snap = snapToWall(pos, segments, nodes, WALL_SNAP_THRESHOLD);
          if (snap) {
            useHistoryStore.getState().push();
            useFixtureStore
              .getState()
              .addWindow(
                snap.wallSegmentId,
                snap.wallParameter,
                snap.snappedPosition.x,
                snap.snappedPosition.y,
                snap.rotation
              );
          }
          break;
        }

        case ToolMode.AddImage:
          config.setImageModalOpen(true);
          break;

        case ToolMode.AddText:
          useHistoryStore.getState().push();
          useMoodboardStore.getState().addText(pos.x, pos.y);
          break;
      }
    },
    [toolMode, clearSelection, config]
  );

  const handleStageMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;
      const pos = getCanvasPos(stage);
      if (!pos) return;

      setCursorPosition(pos);

      if (toolMode === ToolMode.DrawWall) {
        config.wallDrawing.handleMouseMove(pos);
      }
    },
    [toolMode, setCursorPosition, config]
  );

  const handleStageDblClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (toolMode === ToolMode.DrawWall) {
        config.wallDrawing.handleDoubleClick();
      }
    },
    [toolMode, config]
  );

  return {
    handleStageClick,
    handleStageMouseMove,
    handleStageDblClick,
  };
}
