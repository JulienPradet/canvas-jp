import { CanvasJpPoint, CanvasJpWeightedPoint, Point } from "./Point";

// https://javascript.info/bezier-curve
// P = (1−t)^3P1 + 3(1−t)2tP2 +3(1−t)t2P3 + t3P4
export const getBezierAt = (
  start: CanvasJpPoint,
  end: CanvasJpPoint,
  controlPoint1: CanvasJpPoint,
  controlPoint2: CanvasJpPoint,
  t: number
): CanvasJpWeightedPoint => {
  return Point(
    Math.pow(1 - t, 3) * start.x +
      3 * Math.pow(1 - t, 2) * t * controlPoint1.x +
      3 * (1 - t) * t * t * controlPoint2.x +
      t * t * t * end.x,
    Math.pow(1 - t, 3) * start.y +
      3 * Math.pow(1 - t, 2) * t * controlPoint1.y +
      3 * (1 - t) * t * t * controlPoint2.y +
      t * t * t * end.y
  );
};

export const getInBetween = (
  start: CanvasJpPoint,
  end: CanvasJpPoint,
  t: number
): CanvasJpWeightedPoint => {
  return Point(start.x * t + end.x * (1 - t), start.y * t + end.y * (1 - t));
};
