import { angle } from "./angle";
import { distance } from "./distance";
import { findExtremumPointsIndex } from "./findExtremumPoints";
import { translateVector } from "./transform";
import { debug, debugPosition } from "./debug";
import { cyan, red } from "./Color";
import { initTick, tick } from "./tick";
import { Polygon } from "./Polygon";
import { Point } from "./Point";

export const draw = async (
  ctx,
  { background, border, elements },
  { width, height, resolution }
) => {
  const getShapePoints = (shape, angle) => {
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
  const getStyle = (color, shape) => {
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
      console.log(color);
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
  const setStrokeStyle = (stroke, shape) => {
    ctx.globalAlpha = stroke.opacity || 1;
    ctx.strokeStyle = getStyle(stroke.color, shape);
    ctx.lineWidth = stroke.width;
    ctx.lineCap = stroke.style || "butt";
    ctx.lineJoin = stroke.style || "miter";
  };

  const setFillStyle = (fill, shape) => {
    ctx.globalAlpha = fill.opacity || 1;
    ctx.fillStyle = getStyle(fill.color, shape);
  };

  const drawLine = (line) => {
    ctx.beginPath();
    ctx.moveTo(line.start.x, line.start.y);
    ctx.lineTo(line.end.x, line.end.y);

    setStrokeStyle(line.stroke, line);
    ctx.stroke();
  };

  const drawSmoothLine = (line) => {
    smoothPath(line);

    setStrokeStyle(line.stroke, line);
    ctx.stroke();
  };

  const drawShape = (shape) => {
    ctx.beginPath();
    ctx.moveTo(shape.points[0].x, shape.points[0].y);
    shape.points.slice(1).forEach((point) => {
      ctx.lineTo(point.x, point.y);
    });
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

  const smoothPath = (shape) => {
    let controlPoints = new Array(shape.points.length - 1)
      .fill(null)
      .map(() => [null, null]);

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
      ctx.bezierCurveTo(
        controlPoints[index][0].x,
        controlPoints[index][0].y,
        controlPoints[index][1].x,
        controlPoints[index][1].y,
        point.x,
        point.y
      );
    });

    if (debug) {
      ctx.save();
      shape.points.forEach((point) => {
        debugPosition(ctx, point.x, point.y, cyan);
      });
      controlPoints.forEach(([a, b]) => {
        debugPosition(ctx, a.x, a.y, red);
        debugPosition(ctx, b.x, b.y, red);
      });
      ctx.restore();
    }
  };

  const drawSmoothShape = (shape) => {
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

  const drawArc = (arc) => {
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

  const drawClip = (clip) => {
    ctx.save();
    drawElements([clip.shape], ctx);
    ctx.clip();

    drawElements(clip.elements);

    ctx.restore();
  };

  const drawElements = (elements) => {
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
      } else if (Array.isArray(element)) {
        throw new Error("Forgot to spread your elements", element);
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

  const scaleDirection = -1;
  ctx.translate(0, height * resolution);
  ctx.scale(resolution, scaleDirection * resolution);

  const globalShape = Polygon([
    Point(0, 0),
    Point(0, height),
    Point(width, height),
    Point(width, 0),
  ]);
  if (border) {
    setFillStyle({ color: border.color }, globalShape);
    ctx.fillRect(0, 0, width, height);
  }

  if (background) {
    setFillStyle({ color: background }, globalShape);
    const margin = border?.width || 0;
    ctx.fillRect(margin, margin, width - margin * 2, height - margin * 2);
  }

  drawElements(elements, true);

  if (debug) {
    console.groupEnd();
  }

  await tick();
  ctx.restore();
};
