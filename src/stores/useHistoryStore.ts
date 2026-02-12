import { create } from "zustand";
import { useWallStore } from "./useWallStore";
import { useFixtureStore } from "./useFixtureStore";
import { useMoodboardStore } from "./useMoodboardStore";

interface Snapshot {
  walls: { nodes: Record<string, unknown>; segments: Record<string, unknown> };
  fixtures: { doors: Record<string, unknown>; windows: Record<string, unknown> };
  moodboard: { images: Record<string, unknown>; texts: Record<string, unknown> };
}

interface HistoryState {
  past: Snapshot[];
  future: Snapshot[];
  /** Take a snapshot of the current state and push it to the undo stack */
  push: () => void;
  undo: () => void;
  redo: () => void;
}

const MAX_HISTORY = 50;

function takeSnapshot(): Snapshot {
  const { nodes, segments } = useWallStore.getState();
  const { doors, windows } = useFixtureStore.getState();
  const { images, texts } = useMoodboardStore.getState();
  return {
    walls: { nodes: structuredClone(nodes), segments: structuredClone(segments) },
    fixtures: { doors: structuredClone(doors), windows: structuredClone(windows) },
    moodboard: { images: structuredClone(images), texts: structuredClone(texts) },
  };
}

function restoreSnapshot(snap: Snapshot) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useWallStore.getState().loadState(snap.walls as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useFixtureStore.getState().loadState(snap.fixtures as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useMoodboardStore.getState().loadState(snap.moodboard as any);
}

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  past: [],
  future: [],

  push: () => {
    const snapshot = takeSnapshot();
    set((state) => ({
      past: [...state.past.slice(-(MAX_HISTORY - 1)), snapshot],
      future: [],
    }));
  },

  undo: () => {
    const { past } = get();
    if (past.length === 0) return;

    const current = takeSnapshot();
    const previous = past[past.length - 1];

    restoreSnapshot(previous);
    set((state) => ({
      past: state.past.slice(0, -1),
      future: [current, ...state.future],
    }));
  },

  redo: () => {
    const { future } = get();
    if (future.length === 0) return;

    const current = takeSnapshot();
    const next = future[0];

    restoreSnapshot(next);
    set((state) => ({
      past: [...state.past, current],
      future: state.future.slice(1),
    }));
  },
}));
