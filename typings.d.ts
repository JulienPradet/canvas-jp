declare module "canvas-sketch-util/random" {
  export const createRandom: (seed?: number) => {
    getRandomSeed: () => number;
    setSeed: (n: number, opt?: {}) => void;
    getSeed: () => number;
    value: () => number;
    shuffle: <T>(array: Array<T>) => Array<T>;
    noise2D: (
      x: number,
      y: number,
      frequency?: number,
      amplitude?: number
    ) => number;
  };
  export const getRandomSeed: () => number;
  export const setSeed: (n: number, opt?: {}) => void;
  export const getSeed: () => number;
  export const value: () => number;
}
