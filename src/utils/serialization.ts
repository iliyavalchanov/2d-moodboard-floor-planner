import type { ProjectState } from "@/types/project";
import { useWallStore } from "@/stores/useWallStore";
import { useFixtureStore } from "@/stores/useFixtureStore";
import { useMoodboardStore } from "@/stores/useMoodboardStore";
import { useCanvasStore } from "@/stores/useCanvasStore";

/** Gather current state from all stores into a serializable object */
export function gatherProjectState(): ProjectState {
  const { nodes, segments } = useWallStore.getState();
  const { doors, windows } = useFixtureStore.getState();
  const { images, texts } = useMoodboardStore.getState();
  const { viewport } = useCanvasStore.getState();

  return {
    walls: { nodes, segments },
    fixtures: { doors, windows },
    moodboard: { images, texts },
    viewport,
  };
}

/** Restore state from a project snapshot into all stores */
export function restoreProjectState(state: ProjectState) {
  useWallStore.getState().loadState(state.walls);
  useFixtureStore.getState().loadState(state.fixtures);
  useMoodboardStore.getState().loadState(state.moodboard);

  if (state.viewport) {
    useCanvasStore.getState().setViewport(state.viewport);
  }
}

/** Reset all stores to empty state for a new project */
export function resetToEmpty() {
  useWallStore.getState().resetState();
  useFixtureStore.getState().resetState();
  useMoodboardStore.getState().resetState();
  useCanvasStore.getState().setViewport({ x: 0, y: 0, scale: 1 });
}
