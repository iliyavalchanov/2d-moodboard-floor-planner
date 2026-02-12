export interface Point {
  x: number;
  y: number;
}

export enum WallType {
  Interior = "interior",
  Exterior = "exterior",
}

export interface WallNode {
  id: string;
  x: number;
  y: number;
}

export interface WallSegment {
  id: string;
  startNodeId: string;
  endNodeId: string;
  wallType: WallType;
}
