"use client";

import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";

interface Props {
  onSignInClick: () => void;
  onProjectsClick: () => void;
}

export default function UserMenu({ onSignInClick, onProjectsClick }: Props) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const signOut = useAuthStore((s) => s.signOut);

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  if (loading) return null;

  if (!user) {
    return (
      <button
        onClick={onSignInClick}
        className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200"
      >
        Sign In
      </button>
    );
  }

  const initial = (user.email?.[0] ?? "?").toUpperCase();

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-medium flex items-center justify-center hover:bg-blue-700"
        title={user.email ?? "User"}
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.email}
            </p>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              onProjectsClick();
            }}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            My Projects
          </button>
          <button
            onClick={() => {
              setOpen(false);
              signOut();
            }}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
