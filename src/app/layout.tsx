import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Masha 2D Planner",
  description: "Interior design floor planner and moodboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
