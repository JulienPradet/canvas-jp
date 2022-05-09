import { CanvasJpDrawable } from "./draw";

export type CanvasJpUpdateImageData = {
  __type: "UpdateImageData";
  transform: (imageData: ImageData) => ImageData;
};

export const UpdateImageData = (
  transform: (imageData: ImageData) => ImageData
): CanvasJpUpdateImageData => {
  return {
    __type: "UpdateImageData",
    transform,
  };
};
