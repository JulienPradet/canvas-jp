import { CanvasJpExecuteCanvas } from "..";

export function fxhashCollection(
  hashes: {
    generationHash: string;
    id: number;
  }[]
) {
  return function (
    executeCanvasJp: CanvasJpExecuteCanvas,
    container: HTMLElement
  ): CanvasJpExecuteCanvas {
    let destroy: () => void;

    const params = new URLSearchParams(window.location.search);

    let index =
      params.get("index") &&
      Number(params.get("index")) < hashes.length &&
      Number(params.get("index")) >= 0
        ? Number(params.get("index")) - 1
        : Math.floor(Math.random() * hashes.length);

    document
      .querySelector(".details__open")
      ?.setAttribute(
        "href",
        `https://www.fxhash.xyz/gentk/${hashes[index].id}`
      );
    history.replaceState({}, "", `?index=${index + 1}`);

    async function goTo(indexDiff: number) {
      index = (index + indexDiff + hashes.length) % hashes.length;
      document
        .querySelector(".details__open")
        ?.setAttribute(
          "href",
          `https://www.fxhash.xyz/gentk/${hashes[index].id}`
        );

      history.pushState({}, "", `?index=${index + 1}`);

      if (destroy) {
        destroy();
      }

      destroy = await executeCanvasJp(hashes[index].generationHash);
    }

    window.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        goTo(1);
      } else if (event.key === "ArrowLeft") {
        goTo(-1);
      }
    });

    document
      .querySelector(".details__prev")
      ?.addEventListener("click", function (event) {
        event.stopPropagation();
        goTo(-1);
      });
    document
      .querySelector(".details__next")
      ?.addEventListener("click", function (event) {
        event.stopPropagation();
        goTo(1);
      });

    document
      .querySelector(".details__open")
      ?.addEventListener("click", function (event) {
        event.stopPropagation();
      });

    const details = document.querySelector(".details") as HTMLElement;
    const close = document.querySelector(".details__close") as HTMLElement;

    document
      .querySelector(".details__close")
      ?.addEventListener("click", function (event) {
        event.stopPropagation();
        details.classList.remove("open");
        close.blur();
      });

    details.addEventListener("click", function () {
      if (details.classList.contains("open")) {
        details.classList.remove("open");
        details.blur();
      } else {
        details.classList.add("open");
      }
    });

    return async () => {
      destroy = await executeCanvasJp(hashes[index].generationHash);
      return () => destroy();
    };
  };
}
