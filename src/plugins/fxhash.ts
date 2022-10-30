import { CanvasJpExecuteCanvas } from "../index";

declare global {
  interface Window {
    fxhash: number;
    fxpreview: () => {};
  }
}

function fxhash(
  executeCanvasJp: CanvasJpExecuteCanvas,
  container: HTMLElement
): CanvasJpExecuteCanvas {
  return async () => {
    const destroy = await executeCanvasJp(window.fxhash);

    window.fxpreview();

    return destroy;
  };
}

export { fxhash };
