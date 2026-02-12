import { useState, useCallback } from "react";
import type { Point } from "@/types/geometry";

export interface ContextMenuState {
  visible: boolean;
  position: Point;
  canvasPosition: Point;
}

export function useContextMenu() {
  const [menu, setMenu] = useState<ContextMenuState>({
    visible: false,
    position: { x: 0, y: 0 },
    canvasPosition: { x: 0, y: 0 },
  });

  const show = useCallback(
    (screenPos: Point, canvasPos: Point) => {
      setMenu({ visible: true, position: screenPos, canvasPosition: canvasPos });
    },
    []
  );

  const hide = useCallback(() => {
    setMenu((prev) => ({ ...prev, visible: false }));
  }, []);

  return { menu, show, hide };
}
