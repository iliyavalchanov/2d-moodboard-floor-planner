"use client";

import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import { Stage } from "react-konva";
import type Konva from "konva";
import { ToolMode } from "@/types/canvas";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useProjectStore } from "@/stores/useProjectStore";
import { useWallStore } from "@/stores/useWallStore";
import { useFixtureStore } from "@/stores/useFixtureStore";
import { useMoodboardStore } from "@/stores/useMoodboardStore";
import { usePanZoom } from "@/hooks/usePanZoom";
import { useWallDrawing } from "@/hooks/useWallDrawing";
import { useCanvasEvents } from "@/hooks/useCanvasEvents";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useClipboardPaste } from "@/hooks/useClipboardPaste";
import { useContextMenu } from "@/hooks/useContextMenu";
import GridLayer from "./GridLayer";
import WallLayer from "./WallLayer";
import FixtureLayer from "./FixtureLayer";
import MoodboardLayer from "./MoodboardLayer";
import InteractionLayer from "./InteractionLayer";
import Toolbar from "../toolbar/Toolbar";
import StatusBar from "../ui/StatusBar";
import ImageUrlModal from "../ui/ImageUrlModal";
import ContextMenu from "../ui/ContextMenu";
import AuthModal from "../auth/AuthModal";
import ProjectListModal from "../projects/ProjectListModal";

const CURSOR_MAP: Record<ToolMode, string> = {
  [ToolMode.Select]: "default",
  [ToolMode.DrawWall]: "crosshair",
  [ToolMode.PlaceDoor]: "copy",
  [ToolMode.PlaceWindow]: "copy",
  [ToolMode.AddImage]: "cell",
  [ToolMode.AddText]: "text",
};

const AUTOSAVE_DELAY = 2000;

export default function CanvasWorkspace() {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const viewport = useCanvasStore((s) => s.viewport);
  const stageSize = useCanvasStore((s) => s.stageSize);
  const setStageSize = useCanvasStore((s) => s.setStageSize);
  const toolMode = useCanvasStore((s) => s.toolMode);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [projectsModalOpen, setProjectsModalOpen] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);

  const { handleWheel } = usePanZoom();
  const wallDrawing = useWallDrawing();
  const { menu, show: showContextMenu, hide: hideContextMenu } = useContextMenu();

  const eventsConfig = useMemo(
    () => ({
      wallDrawing: {
        handleClick: wallDrawing.handleClick,
        handleMouseMove: wallDrawing.handleMouseMove,
        handleDoubleClick: wallDrawing.handleDoubleClick,
      },
      setImageModalOpen,
    }),
    [wallDrawing.handleClick, wallDrawing.handleMouseMove, wallDrawing.handleDoubleClick]
  );

  const { handleStageClick, handleStageMouseMove, handleStageDblClick } =
    useCanvasEvents(eventsConfig);

  const keyboardConfig = useMemo(
    () => ({ wallDrawingCancel: wallDrawing.cancel }),
    [wallDrawing.cancel]
  );
  useKeyboard(keyboardConfig);
  useClipboardPaste();

  // Space to pan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === "Space" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        setSpaceHeld(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setSpaceHeld(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    useAuthStore.getState().initialize();
  }, []);

  // Auto-load most recent project when user signs in
  useEffect(() => {
    const unsub = useAuthStore.subscribe((state, prev) => {
      if (state.user && !prev.user) {
        // User just signed in — close auth modal, fetch projects, load most recent
        setAuthModalOpen(false);
        useProjectStore.getState().fetchProjects().then(() => {
          const projects = useProjectStore.getState().projects;
          if (projects.length > 0 && !useProjectStore.getState().currentProject) {
            useProjectStore.getState().loadProject(projects[0].id);
          }
        });
      }
      if (!state.user && prev.user) {
        // User signed out — clear project state
        useProjectStore.setState({
          currentProject: null,
          projects: [],
          hasUnsavedChanges: false,
          lastSavedAt: null,
        });
      }
    });
    return unsub;
  }, []);

  // Autosave: subscribe to store changes with debounce
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const handleChange = () => {
      const { currentProject } = useProjectStore.getState();
      if (!currentProject) return;

      useProjectStore.getState().markUnsaved();
      clearTimeout(timer);
      timer = setTimeout(() => {
        useProjectStore.getState().saveProject();
      }, AUTOSAVE_DELAY);
    };

    const unsubs = [
      useWallStore.subscribe(handleChange),
      useFixtureStore.subscribe(handleChange),
      useMoodboardStore.subscribe(handleChange),
    ];

    return () => {
      clearTimeout(timer);
      unsubs.forEach((fn) => fn());
    };
  }, []);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setStageSize(width, height);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [setStageSize]);

  // Right-click handler
  const handleContextMenu = useCallback(
    (e: Konva.KonvaEventObject<PointerEvent>) => {
      e.evt.preventDefault();
      const stage = e.target.getStage();
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const scale = stage.scaleX();
      const canvasPos = {
        x: (pointer.x - stage.x()) / scale,
        y: (pointer.y - stage.y()) / scale,
      };
      showContextMenu({ x: e.evt.clientX, y: e.evt.clientY }, canvasPos);
    },
    [showContextMenu]
  );

  const previewStart = wallDrawing.getActiveNode();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50">
      <Toolbar
        onSignInClick={() => setAuthModalOpen(true)}
        onProjectsClick={() => setProjectsModalOpen(true)}
      />
      <div ref={containerRef} className="w-full h-full">
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          x={viewport.x}
          y={viewport.y}
          scaleX={viewport.scale}
          scaleY={viewport.scale}
          draggable={toolMode === ToolMode.Select || spaceHeld}
          onWheel={handleWheel}
          onClick={handleStageClick}
          onMouseMove={handleStageMouseMove}
          onDblClick={handleStageDblClick}
          onContextMenu={handleContextMenu}
          onDragEnd={(e) => {
            if (e.target === e.target.getStage()) {
              useCanvasStore.getState().setViewport({
                x: e.target.x(),
                y: e.target.y(),
              });
            }
          }}
          style={{ cursor: spaceHeld ? "grab" : CURSOR_MAP[toolMode] }}
        >
          <GridLayer />
          <WallLayer />
          <FixtureLayer />
          <MoodboardLayer />
          <InteractionLayer
            previewStart={previewStart}
            previewEnd={wallDrawing.previewEnd}
            stageRef={stageRef}
          />
        </Stage>
      </div>
      <StatusBar />
      {imageModalOpen && (
        <ImageUrlModal onClose={() => setImageModalOpen(false)} />
      )}
      {menu.visible && (
        <ContextMenu
          position={menu.position}
          canvasPosition={menu.canvasPosition}
          onClose={hideContextMenu}
        />
      )}
      {authModalOpen && (
        <AuthModal onClose={() => setAuthModalOpen(false)} />
      )}
      {projectsModalOpen && (
        <ProjectListModal onClose={() => setProjectsModalOpen(false)} />
      )}
    </div>
  );
}
