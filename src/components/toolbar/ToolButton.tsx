"use client";

import type { ToolMode } from "@/types/canvas";
import { useCanvasStore } from "@/stores/useCanvasStore";

interface Props {
  mode: ToolMode;
  label: string;
  shortcut: string;
  icon: string;
}

export default function ToolButton({ mode, label, shortcut, icon }: Props) {
  const toolMode = useCanvasStore((s) => s.toolMode);
  const setToolMode = useCanvasStore((s) => s.setToolMode);
  const isActive = toolMode === mode;

  return (
    <button
      onClick={() => setToolMode(mode)}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
        transition-colors duration-150
        ${
          isActive
            ? "bg-blue-600 text-white shadow-sm"
            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
        }
      `}
      title={`${label} (${shortcut})`}
    >
      <span>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
