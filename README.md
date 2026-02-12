# Masha 2D Planner

An interior design app combining a 2D floor planner and moodboard on a single interactive canvas.

Built with **Next.js**, **TypeScript**, **Tailwind CSS**, **React-Konva**, and **Zustand**.

## Features

- **Floor Planning** — Draw walls with click-to-place, drag nodes to reshape, toggle interior/exterior wall types
- **Measurements** — Wall lengths displayed in meters on hover
- **Doors & Windows** — Place fixtures that automatically snap to the nearest wall
- **Moodboard** — Add images via URL or Ctrl+V paste, place and edit text boxes inline
- **Pan & Zoom** — Scroll to zoom, drag to pan in select mode
- **Selection** — Click to select, Delete/Backspace to remove, right-click context menu
- **Keyboard Shortcuts** — Number keys 1–6 for tools, Escape to cancel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tools

| Key | Tool | Action |
|-----|------|--------|
| 1 | Select | Click to select, drag to pan |
| 2 | Wall | Click to place nodes, double-click to finish |
| 3 | Door | Click near a wall to place |
| 4 | Window | Click near a wall to place |
| 5 | Image | Opens URL input modal |
| 6 | Text | Click to place, double-click to edit |

## Project Structure

```
src/
├── app/                  # Next.js app router, API routes
├── components/
│   ├── canvas/           # Konva layers and shapes
│   ├── toolbar/          # Tool buttons, wall type toggle
│   └── ui/               # Context menu, modals, status bar
├── stores/               # Zustand stores (canvas, walls, fixtures, moodboard, selection)
├── hooks/                # Canvas events, keyboard, pan/zoom, wall drawing, clipboard
├── types/                # TypeScript interfaces and enums
├── utils/                # Geometry, snapping, measurements, clipboard helpers
└── constants/            # Grid size, snap thresholds, colors, dimensions
```

## Tech Stack

| Package | Purpose |
|---------|---------|
| Next.js 16 | Framework (Turbopack) |
| React-Konva | 2D canvas rendering with layered architecture |
| Zustand + Immer | State management with immutable updates |
| Tailwind CSS 4 | Styling |
| nanoid | ID generation |

## Deployment

Production-ready for Vercel:

```bash
npm run build
```
