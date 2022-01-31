declare module "canvas-sketch-util/random" {
  export const getRandomSeed: () => number;
  export const setSeed: (n: number) => void;
  export const getSeed: () => number;
  export const value: () => number;
}
