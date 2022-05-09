import { CanvasJpDrawable } from "./draw";

export type CanvasJpOverlay = {
  __type: "Overlay";
  elements: CanvasJpDrawable[];
};

export const Overlay = (elements: CanvasJpDrawable[]): CanvasJpOverlay => {
  return {
    __type: "Overlay",
    elements,
  };
};
