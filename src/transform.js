import random from "canvas-sketch-util/random";
import { angle } from "./angle";
import { distance } from "./distance";
import { CurvePoint, Point } from "./Point";
import { Polygon } from "./Polygon";

export const translateVector = (distance, angle, point) => {
  return Point(
    point.x + distance * Math.cos(angle),
    point.y + distance * Math.sin(angle)
  );
};

export const translate = (x, y, point) => {
  if (point.__type === "Point") {
    return Point(x + point.x, y + point.y, point.weight);
  } else if (point.__type === "CurvePoint") {
    return CurvePoint(
      x + point.x,
      y + point.y,
      Point(x + point.prevControl.x, y + point.prevControl.y),
      Point(x + point.nextControl.x, y + point.nextControl.y)
    );
  } else {
    throw new Error("not implemented yet");
  }
};

export const mirrorX = (point) => {
  if (point.__type === "Point") {
    return Point(-point.x, point.y, point.weight);
  } else if (point.__type === "CurvePoint") {
    return CurvePoint(
      -point.x,
      point.y,
      Point(-point.nextControl.x, point.nextControl.y),
      Point(-point.prevControl.x, point.prevControl.y)
    );
  } else {
    throw new Error("not implemented yet");
  }
};

export const stretch = (stretchDistance) => (points) => {
  const center = Polygon(points).center();
  return points.map((point) => {
    const angleFromCenter = angle(center, point);

    return translateVector(stretchDistance, angleFromCenter, point);
  });
};

export const displace =
  (amount, randomFn = () => random.value() - 0.5) =>
  (points) => {
    return points.map((point) => {
      return Point(
        point.x + randomFn() * amount,
        point.y + randomFn() * amount
      );
    });
  };

export const rotate = (center, rotationAngle, point) => {
  if (point.__type === "Point") {
    const angleOfPoint = angle(
      Point(0, 0),
      Point(point.x - center.x, point.y - center.y)
    );
    const transformedAngle = angleOfPoint + rotationAngle;
    return translateVector(distance(center, point), transformedAngle, center);
  } else {
    throw new Error("not implemented yet");
  }
};
