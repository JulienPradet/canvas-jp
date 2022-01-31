import { CanvasJpFill, CanvasJpStroke } from "./draw";
import { CanvasJpPoint } from "./Point";

export type CanvasJpArc = {
  __type: "Arc";
  center: CanvasJpPoint;
  radius: number;
  startAngle: number;
  endAngle: number;
  fill?: CanvasJpFill;
  stroke?: CanvasJpStroke;
};
export const Circle = (
  center: CanvasJpPoint,
  radius: number,
  fill?: CanvasJpFill,
  stroke?: CanvasJpStroke
) => {
  return Arc(center, radius, 0, Math.PI * 2, fill, stroke);
};

export const Arc = (
  center: CanvasJpPoint,
  radius: number,
  startAngle: number,
  endAngle: number,
  fill?: CanvasJpFill,
  stroke?: CanvasJpStroke
): CanvasJpArc => {
  return {
    __type: "Arc",
    center: center,
    radius,
    startAngle,
    endAngle,
    fill,
    stroke,
  };
};
