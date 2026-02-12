"use client";

import { Layer } from "react-konva";
import { useMoodboardStore } from "@/stores/useMoodboardStore";
import MoodboardImage from "./MoodboardImage";
import MoodboardText from "./MoodboardText";

export default function MoodboardLayer() {
  const images = useMoodboardStore((s) => s.images);
  const texts = useMoodboardStore((s) => s.texts);

  return (
    <Layer>
      {Object.values(images).map((img) => (
        <MoodboardImage key={img.id} image={img} />
      ))}
      {Object.values(texts).map((txt) => (
        <MoodboardText key={txt.id} textItem={txt} />
      ))}
    </Layer>
  );
}
