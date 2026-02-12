import { WallType } from "@/types/geometry";

/** Wall colors by type */
export const WALL_COLORS: Record<WallType, string> = {
  [WallType.Interior]: "#4B5563",
  [WallType.Exterior]: "#1F2937",
};

/** Wall thickness in px by type */
export const WALL_THICKNESS: Record<WallType, number> = {
  [WallType.Interior]: 6,
  [WallType.Exterior]: 12,
};

/** Wall node radius */
export const NODE_RADIUS = 5;
export const NODE_COLOR = "#3B82F6";
export const NODE_ACTIVE_COLOR = "#EF4444";

/** Grid */
export const GRID_DOT_COLOR = "#D1D5DB";
export const GRID_DOT_RADIUS = 1.5;

/** Drawing preview */
export const PREVIEW_LINE_COLOR = "#93C5FD";
export const PREVIEW_LINE_DASH = [8, 4];

/** Measurement label */
export const MEASUREMENT_BG_COLOR = "#1F2937";
export const MEASUREMENT_TEXT_COLOR = "#FFFFFF";
export const MEASUREMENT_FONT_SIZE = 12;

/** Door dimensions */
export const DOOR_WIDTH = 40;
export const DOOR_DEPTH = 6;
export const DOOR_COLOR = "#8B5CF6";

/** Window dimensions */
export const WINDOW_WIDTH = 50;
export const WINDOW_DEPTH = 6;
export const WINDOW_COLOR = "#06B6D4";
export const WINDOW_GLASS_COLOR = "#CFFAFE";

/** Selection */
export const SELECTION_COLOR = "#3B82F6";
export const SELECTION_RECT_FILL = "rgba(59,130,246,0.1)";
export const SELECTION_RECT_STROKE = "#3B82F6";

/** Moodboard text defaults */
export const DEFAULT_FONT_SIZE = 18;
export const DEFAULT_FONT_FAMILY = "Inter, sans-serif";
export const DEFAULT_TEXT_COLOR = "#1F2937";
export const DEFAULT_TEXT_WIDTH = 200;
