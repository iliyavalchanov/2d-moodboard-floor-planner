import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { MoodboardImage, MoodboardText } from "@/types/moodboard";
import { generateId } from "@/utils/ids";
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_FONT_FAMILY,
  DEFAULT_TEXT_COLOR,
  DEFAULT_TEXT_WIDTH,
} from "@/constants/styles";

interface MoodboardState {
  images: Record<string, MoodboardImage>;
  texts: Record<string, MoodboardText>;

  addImage: (src: string, x: number, y: number, width: number, height: number) => string;
  removeImage: (id: string) => void;
  updateImage: (id: string, updates: Partial<MoodboardImage>) => void;

  addText: (x: number, y: number) => string;
  removeText: (id: string) => void;
  updateText: (id: string, updates: Partial<MoodboardText>) => void;
}

export const useMoodboardStore = create<MoodboardState>()(
  immer((set) => ({
    images: {},
    texts: {},

    addImage: (src, x, y, width, height) => {
      const id = generateId();
      set((state) => {
        state.images[id] = { id, src, x, y, width, height, rotation: 0 };
      });
      return id;
    },

    removeImage: (id) => {
      set((state) => {
        delete state.images[id];
      });
    },

    updateImage: (id, updates) => {
      set((state) => {
        if (state.images[id]) {
          Object.assign(state.images[id], updates);
        }
      });
    },

    addText: (x, y) => {
      const id = generateId();
      set((state) => {
        state.texts[id] = {
          id,
          text: "Double-click to edit",
          x,
          y,
          fontSize: DEFAULT_FONT_SIZE,
          fontFamily: DEFAULT_FONT_FAMILY,
          fill: DEFAULT_TEXT_COLOR,
          width: DEFAULT_TEXT_WIDTH,
          rotation: 0,
        };
      });
      return id;
    },

    removeText: (id) => {
      set((state) => {
        delete state.texts[id];
      });
    },

    updateText: (id, updates) => {
      set((state) => {
        if (state.texts[id]) {
          Object.assign(state.texts[id], updates);
        }
      });
    },
  }))
);
