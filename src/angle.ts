import { CanvasJpPoint } from "./Point";

export const angle = (a: CanvasJpPoint, b: CanvasJpPoint) =>
  Math.atan2(b.y - a.y, b.x - a.x);

export function radToDeg(radians: number) {
  var pi = Math.PI;
  return radians * (180 / pi);
}
