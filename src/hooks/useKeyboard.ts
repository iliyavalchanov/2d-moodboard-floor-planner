import { useEffect } from "react";
import { ToolMode } from "@/types/canvas";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { useWallStore } from "@/stores/useWallStore";
import { useFixtureStore } from "@/stores/useFixtureStore";
import { useMoodboardStore } from "@/stores/useMoodboardStore";
import { useHistoryStore } from "@/stores/useHistoryStore";

interface KeyboardConfig {
  wallDrawingCancel: () => void;
}

export function useKeyboard(config: KeyboardConfig) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept keyboard when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Undo / Redo
      if (e.key === "z" && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        e.preventDefault();
        useHistoryStore.getState().undo();
        return;
      }
      if (
        (e.key === "z" && (e.metaKey || e.ctrlKey) && e.shiftKey) ||
        (e.key === "y" && (e.metaKey || e.ctrlKey))
      ) {
        e.preventDefault();
        useHistoryStore.getState().redo();
        return;
      }

      switch (e.key) {
        case "Escape": {
          const { toolMode, setToolMode } = useCanvasStore.getState();
          if (toolMode !== ToolMode.Select) {
            config.wallDrawingCancel();
            setToolMode(ToolMode.Select);
          } else {
            useSelectionStore.getState().clearSelection();
          }
          break;
        }

        case "Delete":
        case "Backspace": {
          const { selectedItems, clearSelection } =
            useSelectionStore.getState();
          if (selectedItems.length > 0) {
            useHistoryStore.getState().push();
          }
          for (const item of selectedItems) {
            switch (item.type) {
              case "node":
                useWallStore.getState().removeNode(item.id);
                break;
              case "segment":
                useFixtureStore
                  .getState()
                  .removeFixturesForSegment(item.id);
                useWallStore.getState().removeSegment(item.id);
                break;
              case "door":
                useFixtureStore.getState().removeDoor(item.id);
                break;
              case "window":
                useFixtureStore.getState().removeWindow(item.id);
                break;
              case "image":
                useMoodboardStore.getState().removeImage(item.id);
                break;
              case "text":
                useMoodboardStore.getState().removeText(item.id);
                break;
            }
          }
          clearSelection();
          break;
        }

        // Number key shortcuts for tool switching
        case "1":
          useCanvasStore.getState().setToolMode(ToolMode.Select);
          config.wallDrawingCancel();
          break;
        case "2":
          useCanvasStore.getState().setToolMode(ToolMode.DrawWall);
          break;
        case "3":
          useCanvasStore.getState().setToolMode(ToolMode.PlaceDoor);
          break;
        case "4":
          useCanvasStore.getState().setToolMode(ToolMode.PlaceWindow);
          break;
        case "5":
          useCanvasStore.getState().setToolMode(ToolMode.AddImage);
          break;
        case "6":
          useCanvasStore.getState().setToolMode(ToolMode.AddText);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [config]);
}
