import { Shape } from "./Shape";
import { CanvasJpPoint, Point } from "./Point";
import { CanvasJpColorHsv } from "./Color";

export const Pixel = (point: CanvasJpPoint, background: CanvasJpColorHsv) => {
  return Shape(
    [
      Point(point.x, point.y),
      Point(point.x + 1, point.y),
      Point(point.x + 1, point.y + 1),
      Point(point.x, point.y + 1),
    ],
    background
  );
};
