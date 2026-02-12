"use client";

import { WallType } from "@/types/geometry";
import { useCanvasStore } from "@/stores/useCanvasStore";

export default function WallTypeToggle() {
  const wallType = useCanvasStore((s) => s.wallType);
  const setWallType = useCanvasStore((s) => s.setWallType);

  return (
    <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
      <button
        onClick={() => setWallType(WallType.Exterior)}
        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
          wallType === WallType.Exterior
            ? "bg-gray-800 text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        Exterior
      </button>
      <button
        onClick={() => setWallType(WallType.Interior)}
        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
          wallType === WallType.Interior
            ? "bg-gray-500 text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        Interior
      </button>
    </div>
  );
}
