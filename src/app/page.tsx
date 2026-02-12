"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/stores/useAuthStore";
import AuthModal from "@/components/auth/AuthModal";

const CanvasWorkspace = dynamic(
  () => import("@/components/canvas/CanvasWorkspace"),
  { ssr: false }
);

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  if (loading) {
    return (
      <main className="w-full h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="w-full h-screen bg-gray-50">
        <AuthModal />
      </main>
    );
  }

  return (
    <main className="w-full h-screen">
      <CanvasWorkspace />
    </main>
  );
}
