import { CanvasJpColorHsv, Color } from "./Color";

export let debug = false;

export const debugPosition = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color = Color(1, 1, 0.5),
  size = 4
): void => {
  ctx.save();

  ctx.globalAlpha = 0.9;
  ctx.fillStyle = color.hex();
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

export const debugRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color = Color(1, 1, 0.5)
): void => {
  ctx.save();

  ctx.globalAlpha = 0.5;
  ctx.fillStyle = color.hex();
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.fill();

  ctx.restore();
};

export const debugColor = (
  ctx: CanvasRenderingContext2D,
  color: CanvasJpColorHsv
): void => {
  ctx.save();

  ctx.fillStyle = color.hex();
  ctx.fillRect(0, 0, 50, 50);

  ctx.restore();
};

export const debugEasing = (
  ctx: CanvasRenderingContext2D,
  easeFn: (n: number) => number
): void => {
  ctx.save();

  for (let i = 0; i < 100; i++) {
    ctx.fillStyle = Color(0, 0, easeFn(i / 100)).hex();
    ctx.fillRect(i, 0, 1, 50);
  }

  ctx.restore();
};

export let toggleDebug = () => (debug = !debug);
