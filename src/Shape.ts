import { CanvasJpColorHsv } from "./Color";
import { CanvasJpFill, CanvasJpStroke } from "./draw";
import { CanvasJpPoint } from "./Point";

export type CanvasJpSharpShape = {
  __type: "Shape";
  points: CanvasJpPoint[];
  fill?: CanvasJpFill | null;
  stroke?: CanvasJpStroke | null;
};

export type CanvasJpSmoothShape = {
  __type: "SmoothShape";
  points: CanvasJpPoint[];
  smoothness: number;
  fill?: CanvasJpFill | null;
  stroke?: CanvasJpStroke | null;
};

export type CanvasJpShape = CanvasJpSharpShape | CanvasJpSmoothShape;

const backwardCompatibilityFill = (
  fill: CanvasJpFill | CanvasJpColorHsv | null
): CanvasJpFill | null => {
  let actualFill: CanvasJpFill | null = null;

  if (fill && "color" in fill) {
    actualFill = fill;
  } else if (fill) {
    actualFill = {
      color: fill,
      opacity: 1,
    };
  }

  return actualFill;
};

export const Shape = (
  points: CanvasJpPoint[],
  fill: CanvasJpFill | CanvasJpColorHsv | null = null,
  stroke: CanvasJpStroke | null = null
): CanvasJpSharpShape => {
  return {
    __type: "Shape",
    points: points,
    fill: backwardCompatibilityFill(fill),
    stroke: stroke,
  };
};

export const SmoothShape = (
  points: CanvasJpPoint[],
  smoothness = 1,
  fill: CanvasJpFill | null = null,
  stroke: CanvasJpStroke | null = null
): CanvasJpSmoothShape => {
  return {
    __type: "SmoothShape",
    points: points,
    smoothness: smoothness,
    fill: backwardCompatibilityFill(fill),
    stroke: stroke,
  };
};
