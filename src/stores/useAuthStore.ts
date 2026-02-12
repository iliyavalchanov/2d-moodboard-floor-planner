import { create } from "zustand";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;

  initialize: () => void;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: true,
  error: null,

  initialize: () => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ user: session?.user ?? null, loading: false });
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, loading: false });
    });
  },

  signInWithEmail: async (email, password) => {
    set({ error: null, loading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ loading: false });
    }
  },

  signUpWithEmail: async (email, password) => {
    set({ error: null, loading: true });
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ error: error.message, loading: false });
    } else {
      set({ loading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },

  clearError: () => set({ error: null }),
}));
