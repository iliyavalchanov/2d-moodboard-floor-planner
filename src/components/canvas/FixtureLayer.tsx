"use client";

import { Layer } from "react-konva";
import { useFixtureStore } from "@/stores/useFixtureStore";
import DoorShape from "./DoorShape";
import WindowShape from "./WindowShape";

export default function FixtureLayer() {
  const doors = useFixtureStore((s) => s.doors);
  const windows = useFixtureStore((s) => s.windows);

  return (
    <Layer>
      {Object.values(doors).map((door) => (
        <DoorShape key={door.id} door={door} />
      ))}
      {Object.values(windows).map((win) => (
        <WindowShape key={win.id} window={win} />
      ))}
    </Layer>
  );
}
