import { angle } from "./angle";
import { distanceFromRotatedAbscissa } from "./distance";
import { Point } from "./Point";

export const findExtremumPointsIndex = (points, axisAngle = 0) => {
  if (!Array.isArray(points) || points.length < 0) {
    throw new Error("Can't find lowest point when no point is given.");
  }

  // we want the angle from 0 to 2PI because it's a bit easier to reason about
  let normalizedAngle = (axisAngle + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2);

  let shouldInvert = false;
  if (normalizedAngle >= (Math.PI * 3) / 2 || normalizedAngle < Math.PI / 2) {
    shouldInvert = true;
  }

  const getPointDistance = (point) => {
    let pointDistance = distanceFromRotatedAbscissa(point, normalizedAngle);
    let pointAngle = angle(Point(0, 0), point);
    if (
      normalizedAngle % Math.PI < Math.PI / 2 &&
      normalizedAngle % Math.PI > pointAngle
    ) {
      pointDistance = -pointDistance;
    }
    return pointDistance;
  };

  const extrmumDistances = points.slice(1).reduce(
    (extrmumDistances, point, index) => {
      const pointDistance = getPointDistance(point);
      if (pointDistance < extrmumDistances.minDistance) {
        return {
          minDistance: pointDistance,
          minIndex: index + 1,
          maxDistance: extrmumDistances.maxDistance,
          maxIndex: extrmumDistances.maxIndex,
        };
      } else if (pointDistance > extrmumDistances.maxDistance) {
        return {
          minDistance: extrmumDistances.minDistance,
          minIndex: extrmumDistances.minIndex,
          maxDistance: pointDistance,
          maxIndex: index + 1,
        };
      } else {
        return extrmumDistances;
      }
    },
    {
      minDistance: getPointDistance(points[0]),
      minIndex: 0,
      maxDistance: getPointDistance(points[0]),
      maxIndex: 0,
    }
  );

  let indexes = [extrmumDistances.minIndex, extrmumDistances.maxIndex];

  // Instead of returning those points directly, we need to make sure that the angle is respected
  // so we're projecting the max to a vector starting from min and having the same angle as the parameter.
  // Don't ask why I need the dot parameter. It worked though.
  // https://www.youtube.com/watch?v=fqPiDICPkj8&t=142s
  const minToMaxVector = Point(
    points[indexes[1]].x - points[indexes[0]].x,
    points[indexes[1]].y - points[indexes[0]].y
  );
  const dotProductWithAngle =
    minToMaxVector.x * Math.cos(axisAngle) +
    minToMaxVector.y * Math.sin(axisAngle);

  const result = [
    points[indexes[0]],
    Point(
      dotProductWithAngle * Math.cos(axisAngle) + points[indexes[0]].x,
      dotProductWithAngle * Math.sin(axisAngle) + points[indexes[0]].y
    ),
  ];

  return shouldInvert ? result.reverse() : result;
};
