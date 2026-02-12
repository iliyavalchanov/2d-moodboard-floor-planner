"use client";

import { ToolMode } from "@/types/canvas";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useProjectStore } from "@/stores/useProjectStore";
import ToolButton from "./ToolButton";
import WallTypeToggle from "./WallTypeToggle";
import UserMenu from "./UserMenu";
import SaveIndicator from "./SaveIndicator";

const TOOLS: { mode: ToolMode; label: string; shortcut: string; icon: string }[] = [
  { mode: ToolMode.Select, label: "Select", shortcut: "1", icon: "↖" },
  { mode: ToolMode.DrawWall, label: "Wall", shortcut: "2", icon: "▬" },
  { mode: ToolMode.PlaceDoor, label: "Door", shortcut: "3", icon: "🚪" },
  { mode: ToolMode.PlaceWindow, label: "Window", shortcut: "4", icon: "⊞" },
  { mode: ToolMode.AddImage, label: "Image", shortcut: "5", icon: "🖼" },
  { mode: ToolMode.AddText, label: "Text", shortcut: "6", icon: "T" },
];

interface Props {
  onSignInClick: () => void;
  onProjectsClick: () => void;
}

export default function Toolbar({ onSignInClick, onProjectsClick }: Props) {
  const toolMode = useCanvasStore((s) => s.toolMode);
  const currentProject = useProjectStore((s) => s.currentProject);
  const saveProject = useProjectStore((s) => s.saveProject);

  return (
    <div className="absolute top-4 left-0 right-0 z-10 flex items-center justify-between px-4">
      {/* Left: project name + save indicator */}
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-gray-200">
        <button
          onClick={onProjectsClick}
          className="text-sm text-gray-700 hover:text-blue-600 font-medium truncate max-w-[160px]"
          title="My Projects"
        >
          {currentProject ? currentProject.name : "Untitled"}
        </button>
        <SaveIndicator onSaveClick={saveProject} />
      </div>

      {/* Center: tools */}
      <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg border border-gray-200">
        {TOOLS.map((tool) => (
          <ToolButton key={tool.mode} {...tool} />
        ))}
        {toolMode === ToolMode.DrawWall && (
          <>
            <div className="w-px h-8 bg-gray-300" />
            <WallTypeToggle />
          </>
        )}
      </div>

      {/* Right: user menu */}
      <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border border-gray-200">
        <UserMenu onSignInClick={onSignInClick} onProjectsClick={onProjectsClick} />
      </div>
    </div>
  );
}
