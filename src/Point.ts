import { eDistance } from "./constants";

export type CanvasJpWeightedPoint = {
  __type: "Point";
  x: number;
  y: number;
  weight: number;
};

export type CanvasJpCurvePoint = {
  __type: "CurvePoint";
  x: number;
  y: number;
  prevControl: CanvasJpPoint;
  nextControl: CanvasJpPoint;
};

export type CanvasJpPoint = CanvasJpWeightedPoint | CanvasJpCurvePoint;

export const Point = (
  x: number,
  y: number,
  weight = 1
): CanvasJpWeightedPoint => {
  return {
    __type: "Point",
    x,
    y,
    weight,
  };
};

export const CurvePoint = (
  x: number,
  y: number,
  prevControl: CanvasJpPoint,
  nextControl: CanvasJpPoint
): CanvasJpCurvePoint => {
  return {
    __type: "CurvePoint",
    x,
    y,
    prevControl,
    nextControl,
  };
};

const pointTypes = ["Point", "CurvePoint"];
export const isPointEqual = (
  pointA: CanvasJpPoint,
  pointB: CanvasJpPoint,
  epsilon = eDistance
): boolean => {
  return (
    pointTypes.includes(pointA.__type) &&
    pointTypes.includes(pointB.__type) &&
    Math.abs(pointA.x - pointB.x) < epsilon &&
    Math.abs(pointA.y - pointB.y) < epsilon
  );
};

export const weightPoint = (
  point: CanvasJpPoint,
  weight: number
): CanvasJpWeightedPoint => {
  return Point(point.x, point.y, weight);
};

export type CanvasJpPoint3D = {
  x: number;
  y: number;
  z: number;
};

export const Point3D = (x: number, y: number, z: number): CanvasJpPoint3D => {
  return { x, y, z };
};
