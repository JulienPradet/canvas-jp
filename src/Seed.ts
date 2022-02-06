import { CanvasJpDrawable, CanvasJpRandom } from ".";

export type CanvasJpSeed = {
  __type: "Seed";
  id: number;
  elements: (random: CanvasJpRandom) => CanvasJpDrawable[];
};

export const Seed = (
  id: number,
  elements: (random: CanvasJpRandom) => CanvasJpDrawable[]
): CanvasJpSeed => {
  return {
    __type: "Seed",
    id,
    elements,
  };
};
