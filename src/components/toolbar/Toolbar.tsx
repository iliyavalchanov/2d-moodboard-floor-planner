"use client";

import { ToolMode } from "@/types/canvas";
import { useCanvasStore } from "@/stores/useCanvasStore";
import ToolButton from "./ToolButton";
import WallTypeToggle from "./WallTypeToggle";

const TOOLS: { mode: ToolMode; label: string; shortcut: string; icon: string }[] = [
  { mode: ToolMode.Select, label: "Select", shortcut: "1", icon: "↖" },
  { mode: ToolMode.DrawWall, label: "Wall", shortcut: "2", icon: "▬" },
  { mode: ToolMode.PlaceDoor, label: "Door", shortcut: "3", icon: "🚪" },
  { mode: ToolMode.PlaceWindow, label: "Window", shortcut: "4", icon: "⊞" },
  { mode: ToolMode.AddImage, label: "Image", shortcut: "5", icon: "🖼" },
  { mode: ToolMode.AddText, label: "Text", shortcut: "6", icon: "T" },
];

export default function Toolbar() {
  const toolMode = useCanvasStore((s) => s.toolMode);

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-gray-200">
      {TOOLS.map((tool) => (
        <ToolButton key={tool.mode} {...tool} />
      ))}
      {toolMode === ToolMode.DrawWall && (
        <>
          <div className="w-px h-8 bg-gray-300" />
          <WallTypeToggle />
        </>
      )}
    </div>
  );
}
