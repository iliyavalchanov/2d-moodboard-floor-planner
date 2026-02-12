"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Point } from "@/types/geometry";
import { ToolMode } from "@/types/canvas";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { useWallStore } from "@/stores/useWallStore";
import { useFixtureStore } from "@/stores/useFixtureStore";
import { useMoodboardStore } from "@/stores/useMoodboardStore";

interface Props {
  position: Point;
  canvasPosition: Point;
  onClose: () => void;
}

export default function ContextMenu({ position, canvasPosition, onClose }: Props) {
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedItems = useSelectionStore((s) => s.selectedItems);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const handleDelete = useCallback(() => {
    for (const item of selectedItems) {
      switch (item.type) {
        case "node":
          useWallStore.getState().removeNode(item.id);
          break;
        case "segment":
          useFixtureStore.getState().removeFixturesForSegment(item.id);
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
    useSelectionStore.getState().clearSelection();
    onClose();
  }, [selectedItems, onClose]);

  const handleAddText = useCallback(() => {
    useMoodboardStore.getState().addText(canvasPosition.x, canvasPosition.y);
    onClose();
  }, [canvasPosition, onClose]);

  const handleAddImage = useCallback(() => {
    useCanvasStore.getState().setToolMode(ToolMode.AddImage);
    onClose();
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[160px]"
      style={{ left: position.x, top: position.y }}
    >
      {selectedItems.length > 0 && (
        <button
          onClick={handleDelete}
          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        >
          Delete Selected
        </button>
      )}
      <button
        onClick={handleAddText}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        Add Text Here
      </button>
      <button
        onClick={handleAddImage}
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        Add Image...
      </button>
    </div>
  );
}
