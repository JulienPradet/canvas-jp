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
};

export async function canvasJp<Options = null>(
  container: HTMLElement,
  frameDefinition: (
    t: number,
    frame: number,
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
  }: CanvasJpOptions,
  makeStableOptions?: (pane: Pane | null, paneOptions: Options) => Options
) {
  if (embed) {
    exportSketch = false;
  }

  const initialSeed = Number(localStorage.getItem("lockedSeed"));
  let isSeedLocked = Boolean(initialSeed);
  const seedsHistory = [initialSeed || random.getRandomSeed()];
  let seedIndex = 0;
  random.setSeed(seedsHistory[seedIndex]);

  setMaxDistance(Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2)));

  const canvas = document.createElement("canvas");
  container.appendChild(canvas);

  if (embed) {
    const seedElement = document.createElement("p");
    seedElement.innerText = `${title}: ${random.getSeed()}`;
    document.body.appendChild(seedElement);
  }

  let pane: Pane | null = null;
  if (embed) {
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

  let start = performance.now();
  let current = start;
  let pause = false;
  let exportedUrls: string[] = [];

  let options: Options | null;
  let paneOptions: Options;

  const frame = async (t = 0, frameNumber = 0, looping = false) => {
    if (!options && makeStableOptions) {
      options = makeStableOptions(pane, paneOptions);
    }
    if (!t) {
      start = performance.now();
      t = 0;
      frameNumber = 0;
      looping = false;
    }

    if (debug) {
      console.log("Seed", random.getRandomSeed());
    }
    try {
      const definition = await frameDefinition(t, frameNumber, options);

      if (debug) {
        console.log("drawing...", frameNumber, t);
      }

      await draw(ctx, definition, { height, width, resolution });

      if (!looping && exportSketch) {
        exportedUrls.push(canvas.toDataURL("image/png"));
      }

      const end = performance.now();
      current = end;

      if (animation) {
        if (frameNumber >= numberOfFrames) {
          if (loop) {
            if (makeStableOptions) {
              options = makeStableOptions(pane, paneOptions);
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
        a.download = `${title}-${random.getSeed()}.zip`;
        a.click();
        window.URL.revokeObjectURL(url);
      });
    } else {
      const url = exportedUrls[0];
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}-${random.getSeed()}.png`;
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
    random.setSeed(seedsHistory[seedIndex]);
    options = withOptions;
    frame();
  };
  const loadPreviousSeed = () => {
    seedIndex--;
    random.setSeed(seedsHistory[seedIndex]);
    options = null;
    frame();
  };
  const loadNextSeed = () => {
    seedIndex++;
    random.setSeed(seedsHistory[seedIndex]);
    options = null;
    frame();
  };

  if (pane) {
    pane.on("change", (event) => {
      paneOptions = Object.assign({}, options);
      pushNewSeed();
    });
  }

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

      random.setSeed(seedsHistory[seedIndex]);
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

  await frame(0, 0);
}

export { CanvasJpFrameDefinition, CanvasJpDrawable, CanvasJpOptions };
