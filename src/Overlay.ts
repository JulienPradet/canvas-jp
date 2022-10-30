import { CanvasJpDrawable } from "./draw";

export type CanvasJpOverlay = {
  __type: "Overlay";
  elements: CanvasJpDrawable[];
  compositionOperation?: GlobalCompositeOperation;
};

export const Overlay = (
  elements: CanvasJpDrawable[],
  compositionOperation: GlobalCompositeOperation
): CanvasJpOverlay => {
  return {
    __type: "Overlay",
    elements,
    compositionOperation,
  };
};
