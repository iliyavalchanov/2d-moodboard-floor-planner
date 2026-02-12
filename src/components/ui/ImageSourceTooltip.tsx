"use client";

import { useMoodboardStore } from "@/stores/useMoodboardStore";
import { useCanvasStore } from "@/stores/useCanvasStore";
import type Konva from "konva";

interface Props {
  stageRef: React.RefObject<Konva.Stage | null>;
}

export default function ImageSourceTooltip({ stageRef }: Props) {
  const hoveredImageId = useMoodboardStore((s) => s.hoveredImageId);
  const images = useMoodboardStore((s) => s.images);
  const viewport = useCanvasStore((s) => s.viewport);

  if (!hoveredImageId) return null;

  const image = images[hoveredImageId];
  if (!image?.sourceUrl) return null;

  // Convert canvas coords to screen coords
  const screenX = image.x * viewport.scale + viewport.x;
  const screenY = image.y * viewport.scale + viewport.y;

  // Account for toolbar height offset
  const stage = stageRef.current;
  const stageBox = stage?.container().getBoundingClientRect();
  const offsetTop = stageBox?.top ?? 0;
  const offsetLeft = stageBox?.left ?? 0;

  const domain = (() => {
    try {
      return new URL(image.sourceUrl).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();

  const title = image.title
    ? image.title.length > 40 ? image.title.slice(0, 40) + "..." : image.title
    : "";

  const label = title ? `${title} · ${domain}` : domain;

  return (
    <div
      className="absolute z-40 pointer-events-auto"
      style={{
        left: screenX + offsetLeft,
        top: screenY + offsetTop - 8,
        transform: "translate(-50%, -100%)",
      }}
    >
      <a
        href={image.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block px-3 py-1.5 text-xs text-white bg-gray-900/90 rounded-full whitespace-nowrap hover:bg-gray-900 transition-colors"
      >
        {label}
      </a>
    </div>
  );
}
