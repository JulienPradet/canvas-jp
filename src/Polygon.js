import random from "canvas-sketch-util/random";
import { getIntersection } from "./intersection";
import { Line } from "./Line";
import { Point } from "./Point";
import { Shape } from "./Shape";

export const Polygon = (points) => {
  return {
    __type: "Polygon",
    points,
    toShape: (fill, stroke) => {
      return Shape(points, fill, stroke);
    },
  };
};

export const PolygonFromRect = (x, y, width, height) => {
  return Polygon([
    Point(x, y),
    Point(x + width, y),
    Point(x + width, y + height),
    Point(x, y + height),
  ]);
};

export const PolygonFromCircle = (center, radius, numberOfEdges, phase = 0) => {
  return Polygon(
    new Array(numberOfEdges).fill(null).map((_, index) => {
      return Point(
        center.x +
          radius * Math.cos(Math.PI * 2 * (index / numberOfEdges) + phase),
        center.y +
          radius * Math.sin(Math.PI * 2 * (index / numberOfEdges) + phase)
      );
    })
  );
};

export const polygonArea = ({ points }) => {
  let area = 0; // Accumulates area

  let j = points.length - 1;
  for (let i = 0; i < points.length; i++) {
    area += (points[j].x + points[i].x) * (points[j].y - points[i].y);
    j = i; //j is previous vertex to i
  }
  return Math.abs(area / 2);
};

export const polygonCenter = (polygon) => {
  // X = SUM[(Xi + Xi+1) * (Xi * Yi+1 - Xi+1 * Yi)] / 6 / A
  // Y = SUM[(Yi + Yi+1) * (Xi * Yi+1 - Xi+1 * Yi)] / 6 / A
  let centerX = 0;
  let centerY = 0;
  let currentArea = polygonArea(polygon);
  let coef;
  const points = polygon.points;

  let j = points.length - 1;
  for (let i = 0; i < points.length; i++) {
    coef = points[j].x * points[i].y - points[i].x * points[j].y;
    centerX += (points[j].x + points[i].x) * coef;
    centerY += (points[j].y + points[i].y) * coef;
    j = i; //j is previous vertex to i
  }
  return Point(centerX / 6 / currentArea, centerY / 6 / currentArea);
};

export const polygonLines = (polygon, stroke, width, rounded) => {
  return polygon.points.map((_, index) => {
    const start =
      polygon.points[
        (index - 1 + polygon.points.length) % polygon.points.length
      ];
    const end = polygon.points[index];
    return Line(start, end, stroke, width, rounded);
  });
};

export const isInPolygon = (polygon, point) => {
  const longLine = Line(Point(-100, -100), point);
  let numberOfIntersections = 0;
  for (let i = 0; i < polygon.points.length; i++) {
    if (
      getIntersection(
        longLine,
        Line(
          polygon.points[i],
          polygon.points[
            (i + 1 + polygon.points.length) % polygon.points.length
          ]
        )
      )
    ) {
      numberOfIntersections++;
    }
  }
  return numberOfIntersections % 2 === 1;
};

export const sampleInPolygon = (polygon) => {
  // Let's not care about perf for now
  const xValues = polygon.points.map((p) => p.x);
  const yValues = polygon.points.map((p) => p.y);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  const xDistance = maxX - minX;
  const yDistance = maxY - minY;

  let result;
  do {
    result = Point(
      minX + random.value() * xDistance,
      minY + random.value() * yDistance
    );
  } while (!isInPolygon(polygon, result));

  return result;
};
