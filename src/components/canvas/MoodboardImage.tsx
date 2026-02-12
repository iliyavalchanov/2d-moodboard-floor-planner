"use client";

import { useEffect, useState, useMemo } from "react";
import { Group, Rect, Image as KonvaImage, Text } from "react-konva";
import useImage from "use-image";
import type Konva from "konva";
import type { MoodboardImage as MoodboardImageType } from "@/types/moodboard";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { useMoodboardStore } from "@/stores/useMoodboardStore";
import {
  CARD_FOOTER_COLOR,
  CARD_TITLE_COLOR,
  CARD_DOMAIN_COLOR,
  CARD_FOOTER_RATIO,
} from "@/constants/styles";

interface Props {
  image: MoodboardImageType;
}

/** Extract domain from a URL, stripping www. prefix */
function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export default function MoodboardImage({ image }: Props) {
  const select = useSelectionStore((s) => s.select);
  const updateImage = useMoodboardStore((s) => s.updateImage);

  // Try with crossOrigin first, fall back to proxy
  const [src, setSrc] = useState(image.src);
  const [img, status] = useImage(src, "anonymous");

  useEffect(() => {
    if (status === "failed" && src === image.src && !image.src.startsWith("data:")) {
      setSrc(`/api/proxy-image?url=${encodeURIComponent(image.src)}`);
    }
  }, [status, src, image.src]);

  const isCard = !!image.sourceUrl;

  // Shared event handlers
  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    select({ id: image.id, type: "image" });
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    updateImage(image.id, { x: e.target.x(), y: e.target.y() });
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
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
  };

  const handleDblClick = () => {
    if (image.sourceUrl) {
      window.open(image.sourceUrl, "_blank", "noopener,noreferrer");
    }
  };

  const setCursor = (e: Konva.KonvaEventObject<MouseEvent>, cursor: string) => {
    const stage = e.target.getStage();
    if (stage) stage.container().style.cursor = cursor;
  };

  // --- Plain image (no sourceUrl) ---
  if (!isCard) {
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
        onClick={handleClick}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
    );
  }

  // --- Card layout ---
  const { width, height } = image;
  const footerH = Math.round(height * CARD_FOOTER_RATIO);
  const imageAreaH = height - footerH;
  const padding = Math.round(width * 0.06);
  const cornerRadius = Math.round(width * 0.04);

  // Contain-fit the product image within the upper area
  const imgCrop = useMemo(() => {
    if (!img) return { x: padding, y: padding, w: width - padding * 2, h: imageAreaH - padding * 2 };
    const areaW = width - padding * 2;
    const areaH = imageAreaH - padding * 2;
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const areaAspect = areaW / areaH;

    let drawW: number, drawH: number;
    if (imgAspect > areaAspect) {
      drawW = areaW;
      drawH = areaW / imgAspect;
    } else {
      drawH = areaH;
      drawW = areaH * imgAspect;
    }
    return {
      x: padding + (areaW - drawW) / 2,
      y: padding + (areaH - drawH) / 2,
      w: drawW,
      h: drawH,
    };
  }, [img, width, imageAreaH, padding]);

  // Text sizing relative to card width
  const titleFontSize = Math.max(10, Math.round(width * 0.054));
  const domainFontSize = Math.max(8, Math.round(width * 0.045));
  const textPadX = Math.round(width * 0.05);
  const textPadTop = Math.round(footerH * 0.18);

  const domain = extractDomain(image.sourceUrl!);
  const title = image.title || "";
  const description = image.description || "";
  const subtitle = description || domain;

  return (
    <Group
      id={image.id}
      x={image.x}
      y={image.y}
      width={width}
      height={height}
      rotation={image.rotation}
      draggable
      onClick={handleClick}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
      onDblClick={handleDblClick}
      onMouseEnter={(e) => setCursor(e, "pointer")}
      onMouseLeave={(e) => setCursor(e, "")}
      clipFunc={(ctx: any) => {
        ctx.beginPath();
        ctx.moveTo(cornerRadius, 0);
        ctx.lineTo(width - cornerRadius, 0);
        ctx.arcTo(width, 0, width, cornerRadius, cornerRadius);
        ctx.lineTo(width, height - cornerRadius);
        ctx.arcTo(width, height, width - cornerRadius, height, cornerRadius);
        ctx.lineTo(cornerRadius, height);
        ctx.arcTo(0, height, 0, height - cornerRadius, cornerRadius);
        ctx.lineTo(0, cornerRadius);
        ctx.arcTo(0, 0, cornerRadius, 0, cornerRadius);
        ctx.closePath();
      }}
    >
      {/* White card background */}
      <Rect width={width} height={height} fill="#FFFFFF" />

      {/* Product image (contain-fit) */}
      {img && (
        <KonvaImage
          image={img}
          x={imgCrop.x}
          y={imgCrop.y}
          width={imgCrop.w}
          height={imgCrop.h}
        />
      )}

      {/* Dark footer */}
      <Rect
        y={imageAreaH}
        width={width}
        height={footerH}
        fill={CARD_FOOTER_COLOR}
      />

      {/* Title */}
      {title && (
        <Text
          x={textPadX}
          y={imageAreaH + textPadTop}
          width={width - textPadX * 2}
          text={title}
          fontSize={titleFontSize}
          fontStyle="bold"
          fontFamily="Inter, sans-serif"
          fill={CARD_TITLE_COLOR}
          ellipsis
          wrap="none"
        />
      )}

      {/* Description (falls back to domain) */}
      {subtitle && (
        <Text
          x={textPadX}
          y={imageAreaH + textPadTop + titleFontSize + Math.round(footerH * 0.06)}
          width={width - textPadX * 2}
          text={subtitle}
          fontSize={domainFontSize}
          fontFamily="Inter, sans-serif"
          fill={CARD_DOMAIN_COLOR}
          ellipsis
          wrap="none"
        />
      )}
    </Group>
  );
}
