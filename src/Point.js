import { eDistance } from "./constants";

export const Point = (x, y, weight = 1) => {
  return {
    __type: "Point",
    x,
    y,
    weight,
  };
};

export const CurvePoint = (x, y, prevControl, nextControl) => {
  return {
    __type: "CurvePoint",
    x,
    y,
    prevControl,
    nextControl,
  };
};

const pointTypes = ["Point", "CurvePoint"];
export const isPointEqual = (pointA, pointB, epsilon = eDistance) => {
  return (
    pointTypes.includes(pointA.__type) &&
    pointTypes.includes(pointB.__type) &&
    Math.abs(pointA.x - pointB.x) < epsilon &&
    Math.abs(pointA.y - pointB.y) < epsilon
  );
};
