import { CanvasJpPoint } from "./Point";

export type CanvasJpColorHsv = {
  __type: "Color";
  h: number;
  s: number;
  v: number;
  hex: () => string;
};

/**
 *
 * @param hue [0,1]
 * @param saturation [0,1]
 * @param value [0,1]
 * @returns
 */
export const Color = (
  hue: number,
  saturation: number,
  value: number
): CanvasJpColorHsv => {
  var hex: string;
  return {
    __type: "Color",
    h: hue,
    s: Math.min(1, Math.max(0, saturation)),
    v: Math.min(1, Math.max(0, value)),
    hex: () => {
      if (!hex) {
        try {
          hex = rgbToHex(hsvToRgb(hue, saturation, value));
        } catch (e) {
          console.log({ h: hue, s: saturation, v: value });
          throw e;
        }
      }
      return hex;
    },
  };
};

/**
 * @param colorA
 * @param colorB
 * @param factor [0,1] 0 = only a, 1 = only b
 * @returns
 */
Color.mix = (
  colorA: CanvasJpColorHsv,
  colorB: CanvasJpColorHsv,
  factor: number
) => {
  return Color(
    colorA.h * factor + colorB.h * (1 - factor),
    colorA.s * factor + colorB.s * (1 - factor),
    colorA.v * factor + colorB.v * (1 - factor)
  );
};

export type CanvasJpGradient = {
  __type: "Gradient";
  colors: CanvasJpColorHsv[];
  angle?: number;
};

export const Gradient = (
  colors: CanvasJpColorHsv[],
  angle?: number
): CanvasJpGradient => {
  return {
    __type: "Gradient",
    colors,
    angle,
  };
};

export type CanvasJpRadialGradient = {
  __type: "RadialGradient";
  colors: CanvasJpColorHsv[];
  center: CanvasJpPoint;
  radius: number;
};

export const RadialGradient = (
  colors: CanvasJpColorHsv[],
  center: CanvasJpPoint,
  radius: number
): CanvasJpRadialGradient => {
  return {
    __type: "RadialGradient",
    colors,
    center,
    radius,
  };
};

export const getColorAverage = (
  color: CanvasJpColorHsv | CanvasJpGradient | CanvasJpRadialGradient
): CanvasJpColorHsv => {
  if (color.__type === "Gradient" || color.__type === "RadialGradient") {
    return color.colors.slice(1).reduce((result, color, index) => {
      return Color.mix(result, color, 1 / (index + 2));
    }, color.colors[0]);
  } else {
    return color;
  }
};

/**
 * https://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  hue       The hue
 * @param   Number  saturation       The saturation
 * @param   Number  value       The value
 * @return  Array           The RGB representation
 */
export function hsvToRgb(
  hue: number,
  saturation: number,
  value: number
): [number, number, number] {
  var red: number, green: number, blue: number;

  var i = Math.floor(hue * 6);
  var f = hue * 6 - i;
  var p = value * (1 - saturation);
  var q = value * (1 - f * saturation);
  var t = value * (1 - (1 - f) * saturation);

  switch (i % 6) {
    case 0:
      (red = value), (green = t), (blue = p);
      break;
    case 1:
      (red = q), (green = value), (blue = p);
      break;
    case 2:
      (red = p), (green = value), (blue = t);
      break;
    case 3:
      (red = p), (green = q), (blue = value);
      break;
    case 4:
      (red = t), (green = p), (blue = value);
      break;
    default:
    case 5:
      (red = value), (green = p), (blue = q);
      break;
  }

  return [
    Math.round(red * 255),
    Math.round(green * 255),
    Math.round(blue * 255),
  ];
}

/**
 * https://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  red     The red color value [0,255]
 * @param   Number  green   The green color value [0,255]
 * @param   Number  blue    The blue color value [0,255]
 * @return  Array           The HSV representation
 */
export function rgbToHsv(
  red: number,
  green: number,
  blue: number
): [number, number, number] {
  (red = red / 255), (green = green / 255), (blue = blue / 255);
  var max = Math.max(red, green, blue),
    min = Math.min(red, green, blue);
  var hue: number,
    saturation: number,
    value: number = max;

  var d = max - min;
  saturation = max == 0 ? 0 : d / max;

  if (max == min) {
    hue = 0; // achromatic
  } else {
    switch (max) {
      case red:
        hue = (green - blue) / d + (green < blue ? 6 : 0);
        break;
      case green:
        hue = (blue - red) / d + 2;
        break;
      default:
      case blue:
        hue = (red - green) / d + 4;
        break;
    }
    hue /= 6;
  }

  return [hue, saturation, value];
}

// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function componentToHex(c: number): string {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex([r, g, b]: [number, number, number]): string {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

const colorDiff = (colorA: CanvasJpColorHsv, colorB: CanvasJpColorHsv) => {
  return (
    Math.abs(colorA.h - colorB.h) +
    Math.abs(colorA.s - colorB.s) * 2 +
    Math.abs(colorA.v - colorB.v) * 4
  );
};

export const isColorClose = (
  colorsA: CanvasJpColorHsv,
  colorB: CanvasJpColorHsv,
  approximation: number
) => {
  return colorDiff(colorsA, colorB) < approximation;
};

export const black = Color(0, 0, 0);
export const white = Color(0, 0, 1);
export const green = Color(0.25, 1, 1);
export const cyan = Color(0.5, 1, 1);
export const red = Color(0, 1, 0.9);
