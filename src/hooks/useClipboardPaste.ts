import { useEffect } from "react";
import { useCanvasStore } from "@/stores/useCanvasStore";
import { useMoodboardStore } from "@/stores/useMoodboardStore";
import { readImagesFromClipboard, isImageUrl } from "@/utils/clipboard";

export function useClipboardPaste() {
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      // Don't intercept when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      // Try image blobs first
      const dataUrls = await readImagesFromClipboard(clipboardData);
      if (dataUrls.length > 0) {
        const { viewport, stageSize } = useCanvasStore.getState();
        const centerX =
          (stageSize.width / 2 - viewport.x) / viewport.scale;
        const centerY =
          (stageSize.height / 2 - viewport.y) / viewport.scale;

        for (const url of dataUrls) {
          useMoodboardStore.getState().addImage(url, centerX, centerY, 200, 200);
        }
        return;
      }

      // Try text — check if it's an image URL
      const text = clipboardData.getData("text/plain");
      if (text && isImageUrl(text)) {
        const { viewport, stageSize } = useCanvasStore.getState();
        const centerX =
          (stageSize.width / 2 - viewport.x) / viewport.scale;
        const centerY =
          (stageSize.height / 2 - viewport.y) / viewport.scale;
        useMoodboardStore.getState().addImage(text.trim(), centerX, centerY, 200, 200);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);
}
