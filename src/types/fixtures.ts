export interface Door {
  id: string;
  wallSegmentId: string;
  /** 0–1 parameter along the wall segment */
  wallParameter: number;
  x: number;
  y: number;
  rotation: number;
  width: number;
  /** If true, swing arc is mirrored to the other side */
  flipped?: boolean;
}

export interface Window {
  id: string;
  wallSegmentId: string;
  /** 0–1 parameter along the wall segment */
  wallParameter: number;
  x: number;
  y: number;
  rotation: number;
  width: number;
}
