import random from "canvas-sketch-util/random";
import { angle } from "./angle";
import { distance } from "./distance";
import {
  CanvasJpPoint,
  CanvasJpWeightedPoint,
  CurvePoint,
  Point,
} from "./Point";
import { Polygon, polygonCenter } from "./Polygon";
import { CanvasJpDrawable } from "./draw";

export const translateVector = (
  distance: number,
  angle: number,
  point: CanvasJpPoint
): CanvasJpPoint => {
  if (point.__type === "CurvePoint") {
    return CurvePoint(
      point.x + distance * Math.cos(angle),
      point.y + distance * Math.sin(angle),
      translateVector(distance, angle, point.prevControl),
      translateVector(distance, angle, point.nextControl)
    );
  } else {
    return Point(
      point.x + distance * Math.cos(angle),
      point.y + distance * Math.sin(angle),
      point.weight
    );
  }
};

export const translate = (
  x: number,
  y: number,
  point: CanvasJpPoint
): CanvasJpPoint => {
  if (point.__type === "Point") {
    return Point(x + point.x, y + point.y, point.weight);
  } else {
    return CurvePoint(
      x + point.x,
      y + point.y,
      Point(x + point.prevControl.x, y + point.prevControl.y),
      Point(x + point.nextControl.x, y + point.nextControl.y)
    );
  }
};

export const mirrorX = (point: CanvasJpPoint): CanvasJpPoint => {
  if (point.__type === "Point") {
    return Point(-point.x, point.y, point.weight);
  } else {
    return CurvePoint(
      -point.x,
      point.y,
      Point(-point.nextControl.x, point.nextControl.y),
      Point(-point.prevControl.x, point.prevControl.y)
    );
  }
};

export const stretch =
  (stretchDistance: number) =>
  (points: CanvasJpPoint[]): CanvasJpPoint[] => {
    const center = polygonCenter(Polygon(points));
    return points.map((point) => {
      const angleFromCenter = angle(center, point);
      return translateVector(stretchDistance, angleFromCenter, point);
    });
  };

export const displace =
  (amount: number, randomFn = () => random.value() - 0.5) =>
  (points: CanvasJpPoint[]): CanvasJpPoint[] => {
    return points.map((point) => {
      if (point.__type === "Point") {
        return Point(
          point.x + randomFn() * amount,
          point.y + randomFn() * amount,
          point.weight
        );
      } else {
        return CurvePoint(
          point.x + randomFn() * amount,
          point.y + randomFn() * amount,
          Point(
            point.prevControl.x + randomFn() * amount,
            point.prevControl.y + randomFn() * amount
          ),
          Point(
            point.nextControl.x + randomFn() * amount,
            point.nextControl.y + randomFn() * amount
          )
        );
      }
    });
  };

export const rotate = (
  center: CanvasJpPoint,
  rotationAngle: number,
  point: CanvasJpPoint
): CanvasJpPoint => {
  if (point.__type === "Point") {
    const angleOfPoint = angle(
      Point(0, 0),
      Point(point.x - center.x, point.y - center.y)
    );
    const transformedAngle = angleOfPoint + rotationAngle;
    return translateVector(distance(center, point), transformedAngle, center);
  } else {
    const newPoint = rotate(center, rotationAngle, Point(point.x, point.y))
    return CurvePoint(
        newPoint.x, newPoint.y,
        rotate(center, rotationAngle, Point(point.prevControl.x, point.prevControl.y)),
        rotate(center, rotationAngle, Point(point.nextControl.x, point.nextControl.y))
    )
  }
};

export type CanvasJpTranslate = {
  __type: "Translate";
  x: number;
  y: number;
  elements: CanvasJpDrawable[];
};

export const Translate = (
  x: number,
  y: number,
  elements: CanvasJpDrawable[]
): CanvasJpTranslate => {
  return {
    __type: "Translate",
    x,
    y,
    elements,
  };
};
