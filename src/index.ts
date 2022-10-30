import random from "canvas-sketch-util/random";
import { clamp } from "canvas-sketch-util/math";
import {
  CanvasJpFrameDefinition,
  CanvasJpDrawable,
  CanvasJpStrokeStyle,
  draw,
} from "./draw";

export type CanvasJpPlugin = (
  executeCanvasJp: CanvasJpExecuteCanvas,
  container: HTMLElement
) => CanvasJpExecuteCanvas;

type CanvasJpOptions = {
  width: number;
  height: number;
  resolution: number;
  interactive: boolean;
  plugins?: CanvasJpPlugin[];
};

export type CanvasJpRandom = {
  getSeed: () => number;
  setSeed: (seed: number) => void;
  value: () => number;
  shuffle: <T>(array: Array<T>) => Array<T>;
  pick: <T>(array: Array<T>) => T;
  gaussian: (mean: number, standardDerivation: number) => number;
  onSphere: (radius?: number) => [number, number, number];
  noise1D: (x: number, frequency?: number, amplitude?: number) => number;
  noise2D: (
    x: number,
    y: number,
    frequency?: number,
    amplitude?: number
  ) => number;
  noise3D: (
    x: number,
    y: number,
    z: number,
    frequency?: number,
    amplitude?: number
  ) => number;
};

type CanvasJpDestroy = () => void;

export type CanvasJpExecuteCanvas = (
  initialSeed?: number | string
) => Promise<CanvasJpDestroy>;

export async function canvasJp(
  container: HTMLElement,
  frameDefinition: (
    random: CanvasJpRandom,
    options: { width: number; height: number; resolution: number }
  ) => Generator<
    | CanvasJpFrameDefinition
    | Promise<CanvasJpFrameDefinition>
    | void
    | Promise<void>
  >,
  options: CanvasJpOptions | (() => CanvasJpOptions)
): Promise<CanvasJpDestroy> {
  const executeCanvasJp: CanvasJpExecuteCanvas = async (
    initialSeed?: number | string
  ) => {
    console.log(initialSeed);
    const {
      height,
      width,
      resolution,
      interactive = false,
    } = typeof options === "function" ? options() : options;

    console.log(initialSeed || Number(random.getRandomSeed()));
    let currentRandom: CanvasJpRandom = random.createRandom(
      initialSeed || Number(random.getRandomSeed())
    );

    container.innerHTML = "";
    container.dataset.seed = currentRandom.getSeed() + "";
    const canvas = document.createElement("canvas");
    container.appendChild(canvas);

    container.style.height = `${height * resolution}px`;
    container.style.width = `${width * resolution}px`;

    const pixelDensity = clamp(window.devicePixelRatio || 1, 1, 2);

    const setCanvasSize = (canvas: HTMLCanvasElement) => {
      canvas.width = width * resolution * pixelDensity;
      canvas.height = height * resolution * pixelDensity;
    };

    setCanvasSize(canvas);

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to initialize canvas context");
    }

    let svgElement: HTMLElement | null = null;
    if (interactive && !svgElement) {
      const div = document.createElement("div");
      const svgId = Math.round(Math.random() * 10000);
      div.innerHTML = `<svg
        viewBox="0 0 ${width} ${height}"
        width="${width}"
        height="${height}"
        xmlns="http://www.w3.org/2000/svg"
        class="svg-canvas-jp-${svgId}"
    ></svg>`;

      svgElement = div.children[0] as HTMLElement;

      container.style.position = "relative";

      container.appendChild(svgElement);

      const style = document.createElement("style");
      style.innerHTML = `
        .svg-canvas-jp-${svgId} {
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            transform: scale(1,-1);
        }
        .svg-canvas-jp-${svgId} path {
            cursor: pointer;
            user-select: none;
            fill: transparent;
        }
    `;
      container.appendChild(style);
    }

    let previousListeners: Array<() => void> | null = null;
    const removePreviousListeners = () => {
      if (previousListeners && previousListeners.length) {
        previousListeners.forEach((listener) => listener());
        previousListeners = null;
      }
      container.innerHTML = "";
    };

    const addCanvas = (canvas: HTMLCanvasElement) => {
      const canvasId = Math.round(Math.random() * 10000);
      canvas.classList.add(`canvas-jp-overlay-${canvasId}`);
      setCanvasSize(canvas);

      container.style.position = "relative";
      container.appendChild(canvas);

      const style = document.createElement("style");
      style.innerHTML = `
        .canvas-jp-overlay-${canvasId} {
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
        }
      `;
      container.appendChild(style);
    };

    let frame = async () => {
      try {
        const definition = frameDefinition(currentRandom, {
          width,
          height,
          resolution: resolution * pixelDensity,
        });

        previousListeners = [];
        for await (let definitionItem of definition) {
          if (!definitionItem) {
            continue;
          }

          previousListeners = previousListeners?.concat(
            await draw(
              ctx,
              definitionItem,
              { height, width, resolution, pixelDensity, setSeed: setSeed },
              svgElement,
              { addCanvas, setCanvasSize }
            )
          );
        }
      } catch (e) {
        console.error(`Failed frame`);
        console.error(e);
      }
    };

    const setSeed = (seed: number) => {
      let previousRandom = currentRandom;

      currentRandom = random.createRandom(seed);
      return {
        random: currentRandom,
        reset: () => {
          currentRandom = previousRandom;
        },
      };
    };

    await frame();

    return removePreviousListeners;
  };

  const { plugins = [] } = typeof options === "function" ? options() : options;
  const finalExecuteCanvasJp = plugins.reduce((executeCanvasJp, plugin) => {
    return plugin(executeCanvasJp, container);
  }, executeCanvasJp);

  return finalExecuteCanvasJp();
}

export {
  CanvasJpFrameDefinition,
  CanvasJpDrawable,
  CanvasJpOptions,
  CanvasJpStrokeStyle,
};
