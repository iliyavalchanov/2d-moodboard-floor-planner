import { create } from "zustand";
import { ToolMode, type ViewportState } from "@/types/canvas";
import { WallType } from "@/types/geometry";
import type { Point } from "@/types/geometry";

interface CanvasState {
  // Viewport
  viewport: ViewportState;
  stageSize: { width: number; height: number };
  setViewport: (viewport: Partial<ViewportState>) => void;
  setStageSize: (width: number, height: number) => void;

  // Tool mode
  toolMode: ToolMode;
  setToolMode: (mode: ToolMode) => void;

  // Wall type for drawing
  wallType: WallType;
  setWallType: (type: WallType) => void;

  // Mouse position in canvas coordinates
  cursorPosition: Point;
  setCursorPosition: (pos: Point) => void;
}

export const useCanvasStore = create<CanvasState>()((set) => ({
  viewport: { x: 0, y: 0, scale: 1 },
  stageSize: { width: 1200, height: 800 },
  setViewport: (viewport) =>
    set((state) => ({
      viewport: { ...state.viewport, ...viewport },
    })),
  setStageSize: (width, height) => set({ stageSize: { width, height } }),

  toolMode: ToolMode.Select,
  setToolMode: (mode) => set({ toolMode: mode }),

  wallType: WallType.Exterior,
  setWallType: (type) => set({ wallType: type }),

  cursorPosition: { x: 0, y: 0 },
  setCursorPosition: (pos) => set({ cursorPosition: pos }),
}));
