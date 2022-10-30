import { maxDistance } from "./constants";
import { distance } from "./distance";
import { CanvasJpEdge } from "./edges";
import { CanvasJpSharpLine, Line } from "./Line";
import {
  CanvasJpPoint,
  CanvasJpWeightedPoint,
  isPointEqual,
  Point,
} from "./Point";

export const getIntersection = (
  lineA: CanvasJpEdge,
  lineB: CanvasJpEdge
): CanvasJpWeightedPoint | null => {
  // Check if none of the lines are of length 0
  if (
    (lineA.start.x === lineA.end.x && lineA.start.y === lineA.end.y) ||
    (lineB.start.x === lineB.end.x && lineB.start.y === lineB.end.y)
  ) {
    return null;
  }

  const denominator =
    (lineB.end.y - lineB.start.y) * (lineA.end.x - lineA.start.x) -
    (lineB.end.x - lineB.start.x) * (lineA.end.y - lineA.start.y);

  // Lines are parallel
  if (denominator === 0) {
    return null;
  }

  const ua =
    ((lineB.end.x - lineB.start.x) * (lineA.start.y - lineB.start.y) -
      (lineB.end.y - lineB.start.y) * (lineA.start.x - lineB.start.x)) /
    denominator;
  const ub =
    ((lineA.end.x - lineA.start.x) * (lineA.start.y - lineB.start.y) -
      (lineA.end.y - lineA.start.y) * (lineA.start.x - lineB.start.x)) /
    denominator;

  // is the intersection along the segments
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
    return null;
  }

  // Return a object with the x and y coordinates of the intersection
  const x = lineA.start.x + ua * (lineA.end.x - lineA.start.x);
  const y = lineA.start.y + ua * (lineA.end.y - lineA.start.y);

  return Point(x, y);
};

export const findIntersection = (
  edges: CanvasJpEdge[],
  start: CanvasJpPoint,
  angle: number,
  excludedOptions: CanvasJpPoint[] = []
): CanvasJpPoint | null => {
  const end = Point(
    start.x + maxDistance * Math.cos(angle),
    start.y + maxDistance * Math.sin(angle)
  );
  start = Point(
    start.x - maxDistance * Math.cos(angle),
    start.y - maxDistance * Math.sin(angle)
  );

  const options = edges
    .map((edge) => {
      return getIntersection(edge, { start, end });
    })
    .filter(Boolean)
    .filter((intersection) =>
      excludedOptions.every(
        (option) => !isPointEqual(option, intersection as CanvasJpWeightedPoint)
      )
    )
    .map((intersection) => {
      return {
        intersection,
        distance: distance(start, intersection as CanvasJpWeightedPoint),
      };
    });

  const minOption = options.slice(1).reduce((min, option) => {
    if (option.distance < min.distance) {
      return option;
    } else {
      return min;
    }
  }, options[0]);

  return minOption?.intersection;
};
