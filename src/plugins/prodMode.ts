import { CanvasJpExecuteCanvas } from "../index";

function prodMode(project: string) {
  return function (
    executeCanvasJp: CanvasJpExecuteCanvas,
    container: HTMLElement
  ): CanvasJpExecuteCanvas {
    let touchStart: number | null = null;
    let initialPosition: { x: number; y: number };
    let hasMoved: boolean;
    let touchTimeout: number | undefined;

    container.addEventListener(
      "touchstart",
      (event) => {
        if (touchStart && performance.now() - touchStart < 200) {
          // double tap
          clearTimeout(touchTimeout);
          touchStart = null;
          hasMoved = false;
          toggleFullScreen();
        } else {
          initialPosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
          };
          touchStart = performance.now();
        }
      },
      { passive: false }
    );
    container.addEventListener("touchmove", (event) => {
      hasMoved =
        initialPosition &&
        (Math.abs(initialPosition.x - event.touches[0].clientX) > 20 ||
          Math.abs(initialPosition.y - event.touches[0].clientY) > 20);
    });
    container.addEventListener("touchend", (event) => {
      event.stopPropagation();
      event.preventDefault();
      if (touchStart && performance.now() - touchStart > 300) {
        if (!hasMoved) {
          // long tap
          download();
        }
        clearTimeout(touchTimeout);
        touchStart = null;
      } else {
        touchTimeout = setTimeout(() => {
          touchStart = null;
          executeCanvasJp();
        }, 500);
      }
    });

    // container.addEventListener("mouseup", (event) => {
    //   event.stopPropagation();
    //   event.preventDefault();
    //   executeCanvasJp();
    // });

    var download = function () {
      var link = document.createElement("a");
      link.download = `${project}.png`;
      const canvas = container.querySelector("canvas");
      if (!canvas) {
        throw new Error("No canvas found.");
      }
      link.href = canvas.toDataURL();
      link.click();
    };

    window.addEventListener("keydown", async (event) => {
      if (event.key === " ") {
        await executeCanvasJp();
      } else if (event.key === "s") {
        download();
      } else if (event.key === "Enter") {
        toggleFullScreen();
      }
    });

    let resizeTimeout: number | undefined;
    window.addEventListener("resize", () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }
      resizeTimeout = setTimeout(() => {
        executeCanvasJp();
        resizeTimeout = undefined;
      }, 300);
    });

    async function toggleFullScreen() {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    }

    return (...args) => {
      return executeCanvasJp(...args);
    };
  };
}

export { prodMode };
