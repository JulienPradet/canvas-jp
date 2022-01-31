import { CanvasJpDrawable } from "./draw";
import { CanvasJpShape, CanvasJpSharpShape } from "./Shape";

export type CanvasJpClip = {
  __type: "Clip";
  shape: CanvasJpShape;
  elements: CanvasJpDrawable[];
};

export const Clip = (
  shape: CanvasJpSharpShape,
  elements: CanvasJpDrawable[]
) => {
  return {
    __type: "Clip",
    shape,
    elements,
  };
};
