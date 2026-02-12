import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { WallNode, WallSegment } from "@/types/geometry";
import { WallType } from "@/types/geometry";
import { generateId } from "@/utils/ids";
import { getInitialWallData } from "@/data/floorPlanSeed";

interface WallState {
  nodes: Record<string, WallNode>;
  segments: Record<string, WallSegment>;

  addNode: (x: number, y: number) => string;
  moveNode: (id: string, x: number, y: number) => void;
  removeNode: (id: string) => void;

  addSegment: (
    startNodeId: string,
    endNodeId: string,
    wallType: WallType
  ) => string;
  removeSegment: (id: string) => void;

  /** Find an existing node within a distance threshold */
  findNodeNear: (
    x: number,
    y: number,
    threshold: number
  ) => WallNode | null;
}

const initialData = getInitialWallData();

export const useWallStore = create<WallState>()(
  immer((set, get) => ({
    nodes: initialData.nodes,
    segments: initialData.segments,

    addNode: (x, y) => {
      const id = generateId();
      set((state) => {
        state.nodes[id] = { id, x, y };
      });
      return id;
    },

    moveNode: (id, x, y) => {
      set((state) => {
        if (state.nodes[id]) {
          state.nodes[id].x = x;
          state.nodes[id].y = y;
        }
      });
    },

    removeNode: (id) => {
      set((state) => {
        // Remove all segments connected to this node
        for (const segId of Object.keys(state.segments)) {
          const seg = state.segments[segId];
          if (seg.startNodeId === id || seg.endNodeId === id) {
            delete state.segments[segId];
          }
        }
        delete state.nodes[id];
      });
    },

    addSegment: (startNodeId, endNodeId, wallType) => {
      // Don't create duplicate segments
      const existing = Object.values(get().segments).find(
        (s) =>
          (s.startNodeId === startNodeId && s.endNodeId === endNodeId) ||
          (s.startNodeId === endNodeId && s.endNodeId === startNodeId)
      );
      if (existing) return existing.id;

      const id = generateId();
      set((state) => {
        state.segments[id] = { id, startNodeId, endNodeId, wallType };
      });
      return id;
    },

    removeSegment: (id) => {
      set((state) => {
        delete state.segments[id];
      });
    },

    findNodeNear: (x, y, threshold) => {
      const { nodes } = get();
      for (const node of Object.values(nodes)) {
        const dist = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
        if (dist <= threshold) return node;
      }
      return null;
    },
  }))
);
