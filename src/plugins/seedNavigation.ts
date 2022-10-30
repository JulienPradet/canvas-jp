import { CanvasJpExecuteCanvas } from "../index";

export function seedNavigation(
  executeCanvasJp: CanvasJpExecuteCanvas,
  container: HTMLElement
): CanvasJpExecuteCanvas {
  let seed = Number(window.location.hash.replace(/^#/, ""));
  let forwardStack = 0;

  const setNewSeed = () => {
    seed = Math.floor(Math.random() * 1000000);

    let url = window.location.href;
    if (/#/.test(url)) {
      url = url.replace(/#.*/, "#" + seed);
    } else {
      url += "#" + seed;
    }

    history.pushState({}, "", url);
    executeCanvasJp(seed);
  };

  window.addEventListener("click", (event) => {
    event.stopPropagation();
    setNewSeed();
  });

  window.addEventListener("keydown", async (event) => {
    event.stopPropagation();

    if (event.key === "ArrowRight" || event.key === " ") {
      if (forwardStack > 0) {
        forwardStack--;
        history.forward();
      } else {
        setNewSeed();
      }
    } else if (event.key === "ArrowLeft") {
      history.back();
      forwardStack++;
    }
  });

  window.addEventListener("popstate", (event) => {
    seed = Number(window.location.hash.replace(/^#/, ""));
    executeCanvasJp(seed);
  });

  return async (initialSeed?: number | string) => {
    if (initialSeed) {
      window.location.hash = initialSeed + "";
    } else {
      initialSeed = seed;
    }
    return executeCanvasJp(initialSeed);
  };
}
