"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

interface Props {
  onClose: () => void;
}

export default function AuthModal({ onClose }: Props) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);
  const signIn = useAuthStore((s) => s.signInWithEmail);
  const signUp = useAuthStore((s) => s.signUpWithEmail);
  const clearError = useAuthStore((s) => s.clearError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    if (mode === "signin") {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    clearError();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          {mode === "signin" ? "Sign In" : "Create Account"}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {mode === "signin"
            ? "Sign in to save and load your projects."
            : "Create an account to start saving projects."}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!email.trim() || !password.trim() || loading}
              className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50"
            >
              {loading
                ? "Loading..."
                : mode === "signin"
                  ? "Sign In"
                  : "Sign Up"}
            </button>
          </div>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={switchMode}
            className="text-blue-600 hover:underline"
          >
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}
