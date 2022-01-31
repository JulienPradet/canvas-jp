import { CanvasJpPoint } from "./Point";

export const distance = (a: CanvasJpPoint, b: CanvasJpPoint): number =>
  Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));

export const distanceFromRotatedAbscissa = (
  point: CanvasJpPoint,
  angle: number
): number => {
  return Math.abs(point.x * Math.sin(-angle) + point.y * Math.cos(-angle));
};
