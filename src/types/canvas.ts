export enum ToolMode {
  Select = "select",
  DrawWall = "draw-wall",
  PlaceDoor = "place-door",
  PlaceWindow = "place-window",
  AddImage = "add-image",
  AddText = "add-text",
}

export interface ViewportState {
  x: number;
  y: number;
  scale: number;
}
