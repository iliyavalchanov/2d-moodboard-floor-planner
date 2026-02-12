import { create } from "zustand";

export type SelectableType = "node" | "segment" | "door" | "window" | "image" | "text";

interface SelectionItem {
  id: string;
  type: SelectableType;
}

interface SelectionState {
  selectedItems: SelectionItem[];
  select: (item: SelectionItem) => void;
  addToSelection: (item: SelectionItem) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;
  getSelectedByType: (type: SelectableType) => string[];
}

export const useSelectionStore = create<SelectionState>()((set, get) => ({
  selectedItems: [],

  select: (item) => set({ selectedItems: [item] }),

  addToSelection: (item) =>
    set((state) => {
      if (state.selectedItems.some((i) => i.id === item.id)) return state;
      return { selectedItems: [...state.selectedItems, item] };
    }),

  clearSelection: () => set({ selectedItems: [] }),

  isSelected: (id) => get().selectedItems.some((i) => i.id === id),

  getSelectedByType: (type) =>
    get()
      .selectedItems.filter((i) => i.type === type)
      .map((i) => i.id),
}));
