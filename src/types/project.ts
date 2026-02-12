import type { WallNode, WallSegment } from "./geometry";
import type { Door, Window } from "./fixtures";
import type { MoodboardImage, MoodboardText } from "./moodboard";
import type { ViewportState } from "./canvas";

export interface ProjectState {
  walls: {
    nodes: Record<string, WallNode>;
    segments: Record<string, WallSegment>;
  };
  fixtures: {
    doors: Record<string, Door>;
    windows: Record<string, Window>;
  };
  moodboard: {
    images: Record<string, MoodboardImage>;
    texts: Record<string, MoodboardText>;
  };
  viewport?: ViewportState;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  state: ProjectState;
  created_at: string;
  updated_at: string;
}
