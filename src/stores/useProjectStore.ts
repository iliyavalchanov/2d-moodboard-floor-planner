import { create } from "zustand";
import type { Project } from "@/types/project";
import { supabase } from "@/lib/supabase";
import { gatherProjectState, restoreProjectState, resetToEmpty } from "@/utils/serialization";
import { useAuthStore } from "./useAuthStore";

interface ProjectState {
  currentProject: Project | null;
  projects: Project[];
  saving: boolean;
  loading: boolean;
  lastSavedAt: string | null;
  hasUnsavedChanges: boolean;
  error: string | null;

  fetchProjects: () => Promise<void>;
  createProject: (name: string) => Promise<string | null>;
  loadProject: (id: string) => Promise<void>;
  saveProject: () => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  renameProject: (id: string, name: string) => Promise<void>;
  markUnsaved: () => void;
  clearError: () => void;
}

export const useProjectStore = create<ProjectState>()((set, get) => ({
  currentProject: null,
  projects: [],
  saving: false,
  loading: false,
  lastSavedAt: null,
  hasUnsavedChanges: false,
  error: null,

  fetchProjects: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    set({ loading: true });
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (!error && data) {
      set({ projects: data, loading: false });
    } else {
      set({ loading: false });
    }
  },

  createProject: async (name) => {
    const user = useAuthStore.getState().user;
    if (!user) return null;

    set({ error: null });
    const state = gatherProjectState();
    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name,
        state,
      })
      .select()
      .single();

    if (error) {
      set({ error: error.message });
      return null;
    }
    if (data) {
      set((prev) => ({
        currentProject: data,
        projects: [data, ...prev.projects],
        hasUnsavedChanges: false,
        lastSavedAt: data.updated_at,
        error: null,
      }));
      return data.id;
    }
    return null;
  },

  loadProject: async (id) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      restoreProjectState(data.state);
      set({
        currentProject: data,
        loading: false,
        hasUnsavedChanges: false,
        lastSavedAt: data.updated_at,
      });
    } else {
      set({ loading: false });
    }
  },

  saveProject: async () => {
    const { currentProject, saving } = get();
    if (!currentProject || saving) return;

    set({ saving: true });
    const state = gatherProjectState();
    const { data, error } = await supabase
      .from("projects")
      .update({ state, updated_at: new Date().toISOString() })
      .eq("id", currentProject.id)
      .select()
      .single();

    if (!error && data) {
      set({
        saving: false,
        currentProject: data,
        hasUnsavedChanges: false,
        lastSavedAt: data.updated_at,
      });
      // Update the project in the list too
      set((prev) => ({
        projects: prev.projects.map((p) => (p.id === data.id ? data : p)),
      }));
    } else {
      set({ saving: false });
    }
  },

  deleteProject: async (id) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (!error) {
      set((prev) => {
        const updated: Partial<ProjectState> = {
          projects: prev.projects.filter((p) => p.id !== id),
        };
        if (prev.currentProject?.id === id) {
          updated.currentProject = null;
          updated.hasUnsavedChanges = false;
          updated.lastSavedAt = null;
          resetToEmpty();
        }
        return updated;
      });
    }
  },

  renameProject: async (id, name) => {
    const { error } = await supabase
      .from("projects")
      .update({ name })
      .eq("id", id);

    if (!error) {
      set((prev) => ({
        projects: prev.projects.map((p) => (p.id === id ? { ...p, name } : p)),
        currentProject:
          prev.currentProject?.id === id
            ? { ...prev.currentProject, name }
            : prev.currentProject,
      }));
    }
  },

  markUnsaved: () => {
    if (get().currentProject) {
      set({ hasUnsavedChanges: true });
    }
  },

  clearError: () => set({ error: null }),
}));
