import {
  CanvasJpPoint,
  CanvasJpPoint3D,
  CanvasJpWeightedPoint,
  Point,
  Point3D,
} from "./Point";

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

export const getBezierAt3D = (
  start: CanvasJpPoint3D,
  end: CanvasJpPoint3D,
  controlPoint1: CanvasJpPoint3D,
  controlPoint2: CanvasJpPoint3D,
  t: number
): CanvasJpPoint3D => {
  return Point3D(
    Math.pow(1 - t, 3) * start.x +
      3 * Math.pow(1 - t, 2) * t * controlPoint1.x +
      3 * (1 - t) * t * t * controlPoint2.x +
      t * t * t * end.x,
    Math.pow(1 - t, 3) * start.y +
      3 * Math.pow(1 - t, 2) * t * controlPoint1.y +
      3 * (1 - t) * t * t * controlPoint2.y +
      t * t * t * end.y,
    Math.pow(1 - t, 3) * start.z +
      3 * Math.pow(1 - t, 2) * t * controlPoint1.z +
      3 * (1 - t) * t * t * controlPoint2.z +
      t * t * t * end.z
  );
};

export const getInBetween = (
  start: CanvasJpPoint,
  end: CanvasJpPoint,
  t: number
): CanvasJpWeightedPoint => {
  return Point(start.x * (1 - t) + end.x * t, start.y * (1 - t) + end.y * t);
};
