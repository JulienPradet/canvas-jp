import { CanvasJpPoint } from "./Point";

export type CanvasJpClickRegion = {
  __type: "ClickRegion";
  points: CanvasJpPoint[];
  onClick: () => void;
};

export const ClickRegion = (
  points: CanvasJpPoint[],
  onClick: () => void
): CanvasJpClickRegion => {
  return {
    __type: "ClickRegion",
    points,
    onClick,
  };
};
