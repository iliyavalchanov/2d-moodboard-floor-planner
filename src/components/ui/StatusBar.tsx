"use client";

import { useCanvasStore } from "@/stores/useCanvasStore";

const MODE_LABELS: Record<string, string> = {
  select: "Select",
  "draw-wall": "Draw Wall",
  "place-door": "Place Door",
  "place-window": "Place Window",
  "add-image": "Add Image",
  "add-text": "Add Text",
};

export default function StatusBar() {
  const viewport = useCanvasStore((s) => s.viewport);
  const toolMode = useCanvasStore((s) => s.toolMode);
  const cursorPosition = useCanvasStore((s) => s.cursorPosition);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-2 bg-white/80 backdrop-blur-sm border-t border-gray-200 text-xs text-gray-600">
      <div className="flex items-center gap-4">
        <span className="font-medium">{MODE_LABELS[toolMode]}</span>
        <span>
          X: {Math.round(cursorPosition.x)} Y: {Math.round(cursorPosition.y)}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span>Zoom: {Math.round(viewport.scale * 100)}%</span>
      </div>
    </div>
  );
}
