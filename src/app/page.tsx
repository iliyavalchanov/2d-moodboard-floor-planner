"use client";

import dynamic from "next/dynamic";

const CanvasWorkspace = dynamic(
  () => import("@/components/canvas/CanvasWorkspace"),
  { ssr: false }
);

export default function Home() {
  return (
    <main className="w-full h-screen">
      <CanvasWorkspace />
    </main>
  );
}
