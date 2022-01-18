# canvas-jp

This library is an abstraction of the [Canvas Web API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API).

It was built for fun and it is not ready for consumption overall. But hey, maybe you'll still learn about it somehow.

Usage looks a bit like this:

```js
import { canvasJp } from "canvas-jp";
import { Polygon } from "canvas-jp/Polygon";
import { Point } from "canvas-jp/Point";
import { red } from "canvas-jp/Color";

canvasJp(
  document.querySelector("#container"), // a div element that will contain the canvas
  async function (t: number, frame: number) {
    return {
      elements: [
        Polygon([
          Point(width / 2, 0),
          Point((width / 4) * 3, height / 2),
          Point(width / 2, height),
          Point(width / 4, height / 2),
        ]).toShape({
          color: red,
          opacity: 0.5,
        }),
      ],
    };
  },
  {
    width: width,
    height: height,
    resolution: 1,
    title: "ProjectName",
    animation: false,
    numberOfFrames: frames,
    loop: false,
  }
);
```
