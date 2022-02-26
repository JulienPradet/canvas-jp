import { angle } from "./angle";
import { distance } from "./distance";
import { findExtremumPointsIndex } from "./findExtremumPoints";
import { CanvasJpTranslate, translate, translateVector } from "./transform";
import { debug, debugPosition } from "./debug";
import {
  CanvasJpColorHsv,
  CanvasJpGradient,
  CanvasJpRadialGradient,
  cyan,
  red,
} from "./Color";
import { initTick, tick } from "./tick";
import { Polygon } from "./Polygon";
import { CanvasJpPoint, Point } from "./Point";
import { CanvasJpSharpShape, CanvasJpSmoothShape } from "./Shape";
import { CanvasJpArc } from "./Circle";
import { CanvasJpSharpLine, CanvasJpSmoothLine } from "./Line";
import { CanvasJpClip } from "./Clip";
import { CanvasJpClickRegion, CanvasJpEventHandler } from "./interaction";
import { CanvasJpSeed } from "./Seed";
import { CanvasJpRandom } from ".";

export type CanvasJpFill = {
  color: CanvasJpColorHsv | CanvasJpGradient;
  opacity: number;
};
export enum CanvasJpStrokeStyle {
  "round" = "round",
  "square" = "square",
}
export type CanvasJpStroke = {
  color: CanvasJpColorHsv | CanvasJpGradient;
  opacity: number;
  style?: CanvasJpStrokeStyle;
  width: number;
};
export type CanvasJpDrawable =
  | CanvasJpSharpShape
  | CanvasJpSmoothShape
  | CanvasJpArc
  | CanvasJpSharpLine
  | CanvasJpSmoothLine
  | CanvasJpClip
  | CanvasJpTranslate
  | CanvasJpClickRegion
  | CanvasJpSeed;

export type CanvasJpFrameDefinition = {
  background?: CanvasJpColorHsv;
  border?: CanvasJpStroke;
  elements: CanvasJpDrawable[];
};

export const draw = async (
  ctx: CanvasRenderingContext2D,
  { background, border, elements }: CanvasJpFrameDefinition,
  {
    width,
    height,
    resolution,
    setSeed,
  }: {
    width: number;
    height: number;
    resolution: number;
    setSeed: (id: number) => {
      random: CanvasJpRandom;
      reset: () => void;
    };
  },
  svgContainer: HTMLElement | null
) => {
  let listeners: Array<() => void> = [];
  let currentTranslate: { x: number; y: number } = { x: 0, y: 0 };

  type StylableShape =
    | CanvasJpSharpShape
    | CanvasJpSmoothShape
    | CanvasJpSharpLine
    | CanvasJpSmoothLine
    | CanvasJpArc;

  const getShapePoints = (
    shape: StylableShape,
    angle: number = 0
  ): CanvasJpPoint[] => {
    if (
      shape.__type === "Shape" ||
      shape.__type === "SmoothShape" ||
      shape.__type === "SmoothLine"
    ) {
      return shape.points;
    } else if (shape.__type === "Line") {
      return [shape.start, shape.end];
    } else if (
      shape.__type === "Arc" &&
      shape.startAngle === 0 &&
      shape.endAngle === Math.PI * 2
    ) {
      return [
        translateVector(shape.radius, angle, shape.center),
        translateVector(shape.radius, angle + Math.PI, shape.center),
      ];
    } else {
      throw new Error("not implemented yet");
    }
  };

  const getStyle = (
    color: CanvasJpColorHsv | CanvasJpGradient | CanvasJpRadialGradient,
    shape: StylableShape
  ): string | CanvasGradient => {
    if (color.__type === "Gradient") {
      const points = getShapePoints(shape, color.angle);
      const [lowest, highest] = findExtremumPointsIndex(points, color.angle);

      const gradient = ctx.createLinearGradient(
        lowest.x,
        lowest.y,
        highest.x,
        highest.y
      );
      const length = color.colors.length;
      color.colors.forEach((color, index) => {
        gradient.addColorStop(index / (length - 1), color.hex());
      });
      return gradient;
    } else if (color.__type === "RadialGradient") {
      const gradient = ctx.createRadialGradient(
        color.center.x,
        color.center.y,
        0,
        color.center.x,
        color.center.y,
        color.radius
      );
      const length = color.colors.length;
      color.colors.forEach((color, index) => {
        gradient.addColorStop(index / (length - 1), color.hex());
      });
      return gradient;
    } else {
      return color.hex();
    }
  };

  const mapStyleToLineCap: { [key in CanvasJpStrokeStyle]: CanvasLineCap } = {
    round: "round",
    square: "butt",
  };

  const mapStyleToLineJoin: { [key in CanvasJpStrokeStyle]: CanvasLineJoin } = {
    round: "round",
    square: "miter",
  };

  const setStrokeStyle = (
    stroke: CanvasJpStroke,
    shape: StylableShape
  ): void => {
    ctx.globalAlpha = stroke.opacity || 1;
    ctx.strokeStyle = getStyle(stroke.color, shape);
    ctx.lineWidth = stroke.width;
    ctx.lineCap = stroke.style ? mapStyleToLineCap[stroke.style] : "butt";
    ctx.lineJoin = stroke.style ? mapStyleToLineJoin[stroke.style] : "miter";
  };

  const setFillStyle = (fill: CanvasJpFill, shape: StylableShape): void => {
    ctx.globalAlpha = Number.isNaN(fill.opacity) ? 1 : fill.opacity;
    ctx.fillStyle = getStyle(fill.color, shape);
  };

  const drawLine = (line: CanvasJpSharpLine): void => {
    if (!line.stroke) {
      return;
    }

    ctx.beginPath();
    ctx.moveTo(line.start.x, line.start.y);
    ctx.lineTo(line.end.x, line.end.y);

    setStrokeStyle(line.stroke, line);
    ctx.stroke();
  };

  const drawSmoothLine = (line: CanvasJpSmoothLine): void => {
    if (!line.stroke) {
      return;
    }

    smoothPath(line);

    setStrokeStyle(line.stroke, line);
    ctx.stroke();
  };

  const doShapePath = (shape: CanvasJpSharpShape): void => {
    ctx.beginPath();
    ctx.moveTo(shape.points[0].x, shape.points[0].y);
    shape.points.slice(1).forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
    ctx.closePath();
  };

  const doSvgShapePath = (points: CanvasJpPoint[]): string => {
    let string = "";
    string += `M${points[0].x + currentTranslate.x} ${
      points[0].y + currentTranslate.y
    }`;
    points.slice(1).forEach((point) => {
      string += ` L${point.x + currentTranslate.x} ${
        point.y + currentTranslate.y
      }`;
    });
    return string + " z";
  };

  const drawShape = (shape: CanvasJpSharpShape): void => {
    doShapePath(shape);

    if (shape.fill) {
      setFillStyle(shape.fill, shape);
      ctx.fill();
    }

    if (shape.stroke) {
      setStrokeStyle(shape.stroke, shape);
      ctx.stroke();
    }
  };

  const smoothPath = (
    shape: CanvasJpSmoothShape | CanvasJpSmoothLine
  ): void => {
    let controlPoints: [CanvasJpPoint | null, CanvasJpPoint | null][] =
      new Array(shape.points.length - 1).fill(null).map(() => [null, null]);

    const firstPoint = shape.points[0];
    controlPoints[0][0] =
      firstPoint.__type === "CurvePoint" ? firstPoint.nextControl : firstPoint;

    for (let i = 1; i < shape.points.length - 1; i++) {
      const current = shape.points[i];
      if (current.__type === "CurvePoint") {
        controlPoints[i - 1][1] = current.prevControl;
        controlPoints[i][0] = current.nextControl;
      } else if (current.__type === "Point") {
        const previous = shape.points[i - 1];
        const next = shape.points[i + 1];

        const tangentAngle = angle(previous, next);

        if (controlPoints[i - 1][1] === null) {
          const prevDistance =
            distance(previous, current) * current.weight * shape.smoothness;
          controlPoints[i - 1][1] = translateVector(
            -prevDistance,
            tangentAngle,
            current
          );
        }
        if (controlPoints[i][0] === null) {
          const nextDistance =
            distance(current, next) * current.weight * shape.smoothness;
          controlPoints[i][0] = translateVector(
            nextDistance,
            tangentAngle,
            current
          );
        }
      } else {
        throw new Error("not implemented yet");
      }
    }

    if (!controlPoints[shape.points.length - 2][1]) {
      const lastPoint = shape.points[shape.points.length - 1];
      controlPoints[shape.points.length - 2][1] =
        lastPoint.__type === "CurvePoint" ? lastPoint.prevControl : lastPoint;
    }

    ctx.beginPath();
    ctx.moveTo(shape.points[0].x, shape.points[0].y);
    shape.points.slice(1).forEach((point, index) => {
      if (
        controlPoints[index][0] === null ||
        controlPoints[index][1] === null
      ) {
        throw new Error("Not implemented yet.");
      }

      const prev = controlPoints[index][0] as CanvasJpPoint;
      const next = controlPoints[index][1] as CanvasJpPoint;

      ctx.bezierCurveTo(prev.x, prev.y, next.x, next.y, point.x, point.y);
    });

    if (debug) {
      ctx.save();
      shape.points.forEach((point) => {
        debugPosition(ctx, point.x, point.y, cyan);
      });
      controlPoints.forEach(([a, b]) => {
        if (a) {
          debugPosition(ctx, a.x, a.y, red);
        }
        if (b) {
          debugPosition(ctx, b.x, b.y, red);
        }
      });
      ctx.restore();
    }
  };

  const drawSmoothShape = (shape: CanvasJpSmoothShape): void => {
    smoothPath(shape);
    ctx.closePath();

    if (shape.fill) {
      setFillStyle(shape.fill, shape);
      ctx.fill();
    }

    if (shape.stroke) {
      setStrokeStyle(shape.stroke, shape);
      ctx.stroke();
    }
  };

  const drawArc = (arc: CanvasJpArc): void => {
    ctx.beginPath();
    ctx.arc(
      arc.center.x,
      arc.center.y,
      arc.radius,
      arc.startAngle,
      arc.endAngle
    );
    if (arc.stroke) {
      setStrokeStyle(arc.stroke, arc);
      ctx.stroke();
    }
    if (arc.fill) {
      setFillStyle(arc.fill, arc);
      ctx.fill();
    }
  };

  const drawClip = (clip: CanvasJpClip): void => {
    ctx.save();

    drawElements([clip.shape]);
    ctx.clip();

    drawElements(clip.elements);

    ctx.restore();
  };

  const drawTranslate = (translate: CanvasJpTranslate): void => {
    ctx.save();
    const oldTranslate = currentTranslate;

    currentTranslate = { x: translate.x, y: translate.y };
    ctx.translate(translate.x, translate.y);

    drawElements(translate.elements);

    currentTranslate = oldTranslate;
    ctx.restore();
  };

  const drawClickRegion = (element: CanvasJpClickRegion) => {
    if (!svgContainer) {
      throw new Error(
        'You forgot to set the option "interactive: true" on canvas-jp options.'
      );
    }

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", doSvgShapePath(element.points));

    element.events.forEach(
      <K extends keyof HTMLElementEventMap>({
        on,
        trigger,
      }: CanvasJpEventHandler<K>) => {
        let listener = (event: HTMLElementEventMap[K]) => {
          event.stopPropagation();
          trigger(event);
        };
        path.addEventListener(on, listener);
        listeners.push(() => {
          path.removeEventListener(on, listener);
        });
      }
    );

    svgContainer.appendChild(path);
  };

  const drawSeed = (seed: CanvasJpSeed) => {
    const { reset, random } = setSeed(seed.id);

    drawElements(seed.elements(random));

    reset();
  };

  const drawElements = (elements: CanvasJpDrawable[]) => {
    elements.forEach((element) => {
      if (debug) {
        console.group("Element", element.__type);
      }

      if (element.__type === "Line") {
        drawLine(element);
      } else if (element.__type === "SmoothLine") {
        drawSmoothLine(element);
      } else if (element.__type === "Shape") {
        drawShape(element);
      } else if (element.__type === "SmoothShape") {
        drawSmoothShape(element);
      } else if (element.__type === "Arc") {
        drawArc(element);
      } else if (element.__type === "Clip") {
        drawClip(element);
      } else if (element.__type === "Translate") {
        drawTranslate(element);
      } else if (element.__type === "ClickRegion") {
        drawClickRegion(element);
      } else if (element.__type === "Seed") {
        drawSeed(element);
      }

      if (debug) {
        console.groupEnd();
      }
    });
  };

  ctx.save();
  initTick();
  if (debug) {
    console.group("Draw");
  }

  if (svgContainer) {
    // TODO Remove all listeners before cleaning the existing paths
    svgContainer.innerHTML = "";
  }

  const scaleDirection = -1;
  ctx.translate(0, height * resolution);
  ctx.scale(resolution, scaleDirection * resolution);

  const globalShape = Polygon([
    Point(0, 0),
    Point(0, height),
    Point(width, height),
    Point(width, 0),
  ]).toShape();
  if (border) {
    setFillStyle({ color: border.color, opacity: 1 }, globalShape);
    ctx.fillRect(0, 0, width, height);
  }

  if (background) {
    setFillStyle({ color: background, opacity: 1 }, globalShape);
    const margin = border?.width || 0;
    ctx.fillRect(margin, margin, width - margin * 2, height - margin * 2);
  }

  drawElements(elements);

  if (debug) {
    console.groupEnd();
  }

  await tick();
  ctx.restore();

  return listeners;
};
