import { CanvasJpStroke } from "./draw";
import { CanvasJpPoint } from "./Point";

export type CanvasJpSharpLine = {
  __type: "Line";
  start: CanvasJpPoint;
  end: CanvasJpPoint;
  stroke?: CanvasJpStroke;
};

export type CanvasJpSmoothLine = {
  __type: "SmoothLine";
  points: CanvasJpPoint[];
  smoothness: number;
  stroke?: CanvasJpStroke;
};

export const Line = (
  start: CanvasJpPoint,
  end: CanvasJpPoint,
  stroke?: CanvasJpStroke
): CanvasJpSharpLine => {
  return {
    __type: "Line",
    start,
    end,
    stroke,
  };
};

export const SmoothLine = (
  points: CanvasJpPoint[],
  smoothness = 1,
  stroke?: CanvasJpStroke
): CanvasJpSmoothLine => {
  return {
    __type: "SmoothLine",
    points: points,
    smoothness: smoothness,
    stroke: stroke,
  };
};
