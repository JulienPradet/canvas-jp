import { CanvasJpExecuteCanvas } from "../index";

function devMode(
  executeCanvasJp: CanvasJpExecuteCanvas,
  container: HTMLElement
): CanvasJpExecuteCanvas {
  window.addEventListener("click", () => {
    executeCanvasJp();
  });

  window.addEventListener("keydown", async (event) => {
    if (event.key === " ") {
      executeCanvasJp();
    }
  });

  const resizeObserver = new ResizeObserver(() => {
    executeCanvasJp();
  });
  resizeObserver.observe(document.body);

  return (...args) => executeCanvasJp(...args);
}

export { devMode };
