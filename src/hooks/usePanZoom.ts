import { useCallback, useRef } from "react";
import type Konva from "konva";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { MIN_SCALE, MAX_SCALE, ZOOM_STEP } from "@/constants/canvas";

function getDistance(p1: Touch, p2: Touch): number {
  return Math.sqrt((p2.clientX - p1.clientX) ** 2 + (p2.clientY - p1.clientY) ** 2);
}

function getCenter(p1: Touch, p2: Touch): { x: number; y: number } {
  return {
    x: (p1.clientX + p2.clientX) / 2,
    y: (p1.clientY + p2.clientY) / 2,
  };
}

export function usePanZoom() {
  const setViewport = useCanvasStore((s) => s.setViewport);

  const lastDist = useRef(0);
  const lastCenter = useRef<{ x: number; y: number } | null>(null);

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = e.target.getStage();
      if (!stage) return;

      const oldScale = stage.scaleX();
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      };

      const direction = e.evt.deltaY > 0 ? -1 : 1;
      const newScale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, direction > 0 ? oldScale * ZOOM_STEP : oldScale / ZOOM_STEP)
      );

      setViewport({
        scale: newScale,
        x: pointer.x - mousePointTo.x * newScale,
        y: pointer.y - mousePointTo.y * newScale,
      });
    },
    [setViewport]
  );

  const handleTouchStart = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      const touch = e.evt.touches;
      if (touch.length === 2) {
        // Prevent default browser pinch-zoom
        e.evt.preventDefault();

        const stage = e.target.getStage();
        if (stage) {
          // Stop Konva drag so we control movement ourselves
          stage.stopDrag();
        }

        lastDist.current = getDistance(touch[0], touch[1]);
        lastCenter.current = getCenter(touch[0], touch[1]);
      }
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      const touch = e.evt.touches;
      if (touch.length !== 2) return;

      e.evt.preventDefault();

      const stage = e.target.getStage();
      if (!stage) return;

      const newDist = getDistance(touch[0], touch[1]);
      const newCenter = getCenter(touch[0], touch[1]);

      if (!lastCenter.current || lastDist.current === 0) {
        lastDist.current = newDist;
        lastCenter.current = newCenter;
        return;
      }

      const oldScale = stage.scaleX();

      // Calculate new scale from pinch distance ratio
      const scaleFactor = newDist / lastDist.current;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, oldScale * scaleFactor));

      // Get the pinch center relative to the stage container
      const container = stage.container();
      const rect = container.getBoundingClientRect();
      const pinchCenter = {
        x: newCenter.x - rect.left,
        y: newCenter.y - rect.top,
      };

      // Calculate position so zoom is centered on pinch point
      const pointTo = {
        x: (pinchCenter.x - stage.x()) / oldScale,
        y: (pinchCenter.y - stage.y()) / oldScale,
      };

      // Also handle panning from two-finger drag
      const dx = newCenter.x - lastCenter.current.x;
      const dy = newCenter.y - lastCenter.current.y;

      const newX = pinchCenter.x - pointTo.x * newScale + dx;
      const newY = pinchCenter.y - pointTo.y * newScale + dy;

      setViewport({
        scale: newScale,
        x: newX,
        y: newY,
      });

      lastDist.current = newDist;
      lastCenter.current = newCenter;
    },
    [setViewport]
  );

  const handleTouchEnd = useCallback(
    (e: Konva.KonvaEventObject<TouchEvent>) => {
      if (e.evt.touches.length < 2) {
        lastDist.current = 0;
        lastCenter.current = null;
      }
    },
    []
  );

  return { handleWheel, handleTouchStart, handleTouchMove, handleTouchEnd };
}
