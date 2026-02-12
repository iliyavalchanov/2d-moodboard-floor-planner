export interface Door {
  id: string;
  wallSegmentId: string;
  /** 0–1 parameter along the wall segment */
  wallParameter: number;
  x: number;
  y: number;
  rotation: number;
  width: number;
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
