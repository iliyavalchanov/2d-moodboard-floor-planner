"use client";

import { useRef, useEffect, useState } from "react";
import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import type { MoodboardImage as MoodboardImageType } from "@/types/moodboard";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { useMoodboardStore } from "@/stores/useMoodboardStore";

interface Props {
  image: MoodboardImageType;
}

export default function MoodboardImage({ image }: Props) {
  const select = useSelectionStore((s) => s.select);
  const updateImage = useMoodboardStore((s) => s.updateImage);
  const setHoveredImageId = useMoodboardStore((s) => s.setHoveredImageId);

  // Try with crossOrigin first, fall back to proxy
  const [src, setSrc] = useState(image.src);
  const [img, status] = useImage(src, "anonymous");

  useEffect(() => {
    if (status === "failed" && src === image.src && !image.src.startsWith("data:")) {
      setSrc(`/api/proxy-image?url=${encodeURIComponent(image.src)}`);
    }
  }, [status, src, image.src]);

  return (
    <KonvaImage
      id={image.id}
      image={img}
      x={image.x}
      y={image.y}
      width={image.width}
      height={image.height}
      rotation={image.rotation}
      draggable
      onClick={(e) => {
        e.cancelBubble = true;
        select({ id: image.id, type: "image" });
      }}
      onDragEnd={(e) => {
        updateImage(image.id, { x: e.target.x(), y: e.target.y() });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        updateImage(image.id, {
          x: node.x(),
          y: node.y(),
          width: Math.max(20, node.width() * node.scaleX()),
          height: Math.max(20, node.height() * node.scaleY()),
          rotation: node.rotation(),
        });
        node.scaleX(1);
        node.scaleY(1);
      }}
      onMouseEnter={(e) => {
        if (image.sourceUrl) {
          setHoveredImageId(image.id);
          const stage = e.target.getStage();
          if (stage) {
            stage.container().style.cursor = "pointer";
          }
        }
      }}
      onMouseLeave={(e) => {
        if (image.sourceUrl) {
          setHoveredImageId(null);
          const stage = e.target.getStage();
          if (stage) {
            stage.container().style.cursor = "";
          }
        }
      }}
      onDblClick={() => {
        if (image.sourceUrl) {
          window.open(image.sourceUrl, "_blank", "noopener,noreferrer");
        }
      }}
    />
  );
}
