"use client";

import { useRef, useCallback } from "react";
import { Text } from "react-konva";
import type Konva from "konva";
import type { MoodboardText as MoodboardTextType } from "@/types/moodboard";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { useMoodboardStore } from "@/stores/useMoodboardStore";

interface Props {
  textItem: MoodboardTextType;
}

export default function MoodboardText({ textItem }: Props) {
  const textRef = useRef<Konva.Text>(null);
  const select = useSelectionStore((s) => s.select);
  const updateText = useMoodboardStore((s) => s.updateText);

  const handleDblClick = useCallback(() => {
    const textNode = textRef.current;
    if (!textNode) return;

    const stage = textNode.getStage();
    if (!stage) return;
    const container = stage.container();

    // Hide Konva text
    textNode.hide();

    const textPosition = textNode.absolutePosition();
    const stageBox = container.getBoundingClientRect();

    const textarea = document.createElement("textarea");
    container.appendChild(textarea);

    textarea.value = textItem.text;
    textarea.style.position = "absolute";
    textarea.style.top = `${textPosition.y + stageBox.top - window.scrollY}px`;
    textarea.style.left = `${textPosition.x + stageBox.left - window.scrollX}px`;
    textarea.style.width = `${textItem.width}px`;
    textarea.style.fontSize = `${textItem.fontSize * stage.scaleX()}px`;
    textarea.style.fontFamily = textItem.fontFamily;
    textarea.style.color = textItem.fill;
    textarea.style.border = "1px solid #3B82F6";
    textarea.style.padding = "2px";
    textarea.style.margin = "0px";
    textarea.style.background = "white";
    textarea.style.outline = "none";
    textarea.style.resize = "none";
    textarea.style.lineHeight = "1.2";
    textarea.style.zIndex = "1000";

    textarea.focus();

    const finishEditing = () => {
      updateText(textItem.id, { text: textarea.value });
      textarea.remove();
      textNode.show();
    };

    textarea.addEventListener("blur", finishEditing);
    textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        textarea.blur();
      }
      if (e.key === "Escape") {
        textarea.blur();
      }
    });
  }, [textItem, updateText]);

  return (
    <Text
      ref={textRef}
      x={textItem.x}
      y={textItem.y}
      text={textItem.text}
      fontSize={textItem.fontSize}
      fontFamily={textItem.fontFamily}
      fill={textItem.fill}
      width={textItem.width}
      rotation={textItem.rotation}
      draggable
      onClick={(e) => {
        e.cancelBubble = true;
        select({ id: textItem.id, type: "text" });
      }}
      onDblClick={handleDblClick}
      onDragEnd={(e) => {
        updateText(textItem.id, { x: e.target.x(), y: e.target.y() });
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        updateText(textItem.id, {
          x: node.x(),
          y: node.y(),
          width: Math.max(20, node.width() * node.scaleX()),
          rotation: node.rotation(),
        });
        node.scaleX(1);
        node.scaleY(1);
      }}
    />
  );
}
