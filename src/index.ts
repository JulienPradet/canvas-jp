import random from "canvas-sketch-util/random";
import JSZip from "jszip";
import { setMaxDistance } from "./constants";
import { debug, toggleDebug } from "./debug";
import { CanvasJpFrameDefinition, CanvasJpDrawable, draw } from "./draw";
import { Pane } from "tweakpane";

type CanvasJpOptions = {
  width: number;
  height: number;
  resolution: number;
  title: string;
  animation: boolean;
  numberOfFrames: number;
  loop: boolean;
  exportSketch: boolean;
  embed: boolean;
  interactive: boolean;
};

export type CanvasJpRandom = {
  getSeed: () => number;
  value: () => number;
  noise2D: (
    x: number,
    y: number,
    frequency?: number,
    amplitude?: number
  ) => number;
};

export async function canvasJp<Options = null>(
  container: HTMLElement,
  frameDefinition: (
    t: number,
    frame: number,
    random: CanvasJpRandom,
    options: Options | null
  ) => Promise<CanvasJpFrameDefinition> | CanvasJpFrameDefinition,
  {
    height,
    width,
    resolution,
    title,
    animation = false,
    numberOfFrames = 1,
    loop = false,
    exportSketch = true,
    embed = false,
    interactive = false,
  }: CanvasJpOptions,
  makeStableOptions?: (
    random: CanvasJpRandom,
    pane: Pane | null,
    paneOptions: Options
  ) => Options
) {
  if (embed) {
    exportSketch = false;
  }

  const initialSeed = Number(localStorage.getItem("lockedSeed"));
  let isSeedLocked = Boolean(initialSeed);
  const seedsHistory = [initialSeed || random.getRandomSeed()];
  let seedIndex = 0;
  let currentRandom: CanvasJpRandom = random.createRandom(
    seedsHistory[seedIndex]
  );

  setMaxDistance(Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)));

  const canvas = document.createElement("canvas");
  container.appendChild(canvas);

  if (!embed) {
    const seedElement = document.createElement("p");
    seedElement.innerText = `${title}: ${currentRandom.getSeed()}`;
    document.body.appendChild(seedElement);
  }

  let pane: Pane | null = null;
  if (!embed) {
    pane = new Pane();
  }

  container.style.height = `${height}px`;
  container.style.width = `${width}px`;

  canvas.width = width * resolution;
  canvas.height = height * resolution;
  canvas.style.transform = `translate(${width * (-resolution / 2 + 0.5)}px, ${
    height * (-resolution / 2 + 0.5)
  }px) scale(${1 / resolution}, ${1 / resolution})`;

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

  let start = performance.now();
  let current = start;
  let pause = false;
  let exportedUrls: string[] = [];

  let options: Options | null;
  let paneOptions: Options;

  const frame = async (t = 0, frameNumber = 0, looping = false) => {
    if (!options && makeStableOptions) {
      options = makeStableOptions(currentRandom, pane, paneOptions);
    }
    if (!t) {
      start = performance.now();
      t = 0;
      frameNumber = 0;
      looping = false;
    }

    if (debug) {
      console.log("Seed", currentRandom.getSeed());
    }
    try {
      const definition = await frameDefinition(
        t,
        frameNumber,
        currentRandom,
        options
      );

      if (debug) {
        console.log("drawing...", frameNumber, t);
      }

      await draw(
        ctx,
        definition,
        { height, width, resolution, setSeed: setSeed },
        svgElement
      );

      if (!looping && exportSketch) {
        exportedUrls.push(canvas.toDataURL("image/png"));
      }

      const end = performance.now();
      current = end;

      if (animation) {
        if (frameNumber >= numberOfFrames) {
          if (loop) {
            if (makeStableOptions) {
              options = makeStableOptions(currentRandom, pane, paneOptions);
            }
            frame(current - start, 0, true);
          } else {
            console.log("done.", t, frameNumber);
          }
        } else {
          frame(current - start, frameNumber + 1, looping);
        }
      } else {
        console.log("done.", t, frameNumber);
      }
    } catch (e) {
      console.error(`Failed frame`);
      console.error(e);
      pause = true;
    }
  };

  const saveImage = () => {
    if (animation) {
      var zip = new JSZip();
      exportedUrls.forEach((imgData, index) => {
        zip.file(
          `${index.toString().padStart(3, "0")}.png`,
          imgData.split(";base64,")[1],
          {
            base64: true,
          }
        );
        window.URL.revokeObjectURL(imgData);
      });
      zip.generateAsync({ type: "blob" }).then(function (blob) {
        // see FileSaver.js
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title}-${currentRandom.getSeed()}.zip`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
    } else {
      const url = exportedUrls[0];
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}-${currentRandom.getSeed()}.png`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  const lockSeed = () => {
    localStorage.setItem("lockedSeed", seedsHistory[seedIndex].toString());
    isSeedLocked = true;
  };
  const unlockSeed = () => {
    localStorage.removeItem("lockedSeed");
  };
  const pushNewSeed = (withOptions: Options | null = null) => {
    if (isSeedLocked) {
      return;
    }

    seedsHistory.push(random.getRandomSeed());
    seedIndex = seedsHistory.length - 1;
    currentRandom = random.createRandom(seedsHistory[seedIndex]);
    options = withOptions;
    frame();
  };
  const loadPreviousSeed = () => {
    seedIndex--;
    currentRandom = random.createRandom(seedsHistory[seedIndex]);
    options = null;
    frame();
  };
  const loadNextSeed = () => {
    seedIndex++;
    currentRandom = random.createRandom(seedsHistory[seedIndex]);
    options = null;
    frame();
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

  if (pane) {
    pane.on("change", (event) => {
      paneOptions = Object.assign({}, options);
      pushNewSeed();
    });
  }

  if (!embed) {
    window.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      const paneElement = pane?.element;
      if (paneElement?.contains(event.target as Node)) {
        return;
      }

      pushNewSeed();
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "s" && event.ctrlKey) {
        event.preventDefault();
        event.stopPropagation();
        saveImage();
      } else if (event.key === "l" && event.ctrlKey) {
        event.preventDefault();
        event.stopPropagation();
        if (localStorage.getItem("lockedSeed")) {
          unlockSeed();
          pushNewSeed();
        } else {
          console.log("lock");
          lockSeed();
        }
      } else if (event.key === "d" && event.ctrlKey) {
        event.preventDefault();
        event.stopPropagation();
        toggleDebug();
        localStorage.setItem("debugCanvas", debug ? "1" : "0");

        currentRandom = random.createRandom(seedsHistory[seedIndex]);
        options = null;
        frame();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        event.stopPropagation();
        loadPreviousSeed();
      } else if (
        event.key === "ArrowRight" &&
        seedIndex < seedsHistory.length - 1
      ) {
        event.preventDefault();
        event.stopPropagation();
        loadNextSeed();
      } else if (event.key === " " || event.key === "ArrowRight") {
        event.preventDefault();
        event.stopPropagation();
        pushNewSeed();
      } else if (event.key === "p") {
        event.preventDefault();
        event.stopPropagation();
        pause = !pause;
      }
    });
  }

  await frame(0, 0);
}

export { CanvasJpFrameDefinition, CanvasJpDrawable, CanvasJpOptions };
