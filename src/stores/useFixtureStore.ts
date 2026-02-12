import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Door, Window } from "@/types/fixtures";
import { generateId } from "@/utils/ids";
import { DOOR_WIDTH, WINDOW_WIDTH } from "@/constants/styles";

interface FixtureState {
  doors: Record<string, Door>;
  windows: Record<string, Window>;

  addDoor: (
    wallSegmentId: string,
    wallParameter: number,
    x: number,
    y: number,
    rotation: number
  ) => string;
  removeDoor: (id: string) => void;
  updateDoor: (id: string, updates: Partial<Door>) => void;

  addWindow: (
    wallSegmentId: string,
    wallParameter: number,
    x: number,
    y: number,
    rotation: number
  ) => string;
  removeWindow: (id: string) => void;
  updateWindow: (id: string, updates: Partial<Window>) => void;

  /** Remove all fixtures attached to a wall segment */
  removeFixturesForSegment: (segmentId: string) => void;
}

export const useFixtureStore = create<FixtureState>()(
  immer((set) => ({
    doors: {},
    windows: {},

    addDoor: (wallSegmentId, wallParameter, x, y, rotation) => {
      const id = generateId();
      set((state) => {
        state.doors[id] = {
          id,
          wallSegmentId,
          wallParameter,
          x,
          y,
          rotation,
          width: DOOR_WIDTH,
        };
      });
      return id;
    },

    removeDoor: (id) => {
      set((state) => {
        delete state.doors[id];
      });
    },

    updateDoor: (id, updates) => {
      set((state) => {
        if (state.doors[id]) {
          Object.assign(state.doors[id], updates);
        }
      });
    },

    addWindow: (wallSegmentId, wallParameter, x, y, rotation) => {
      const id = generateId();
      set((state) => {
        state.windows[id] = {
          id,
          wallSegmentId,
          wallParameter,
          x,
          y,
          rotation,
          width: WINDOW_WIDTH,
        };
      });
      return id;
    },

    removeWindow: (id) => {
      set((state) => {
        delete state.windows[id];
      });
    },

    updateWindow: (id, updates) => {
      set((state) => {
        if (state.windows[id]) {
          Object.assign(state.windows[id], updates);
        }
      });
    },

    removeFixturesForSegment: (segmentId) => {
      set((state) => {
        for (const [id, door] of Object.entries(state.doors)) {
          if (door.wallSegmentId === segmentId) delete state.doors[id];
        }
        for (const [id, win] of Object.entries(state.windows)) {
          if (win.wallSegmentId === segmentId) delete state.windows[id];
        }
      });
    },
  }))
);
