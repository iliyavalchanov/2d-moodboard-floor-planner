export interface MoodboardImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  sourceUrl?: string;
  title?: string;
}

export interface MoodboardText {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontFamily: string;
  fill: string;
  width: number;
  rotation: number;
}
