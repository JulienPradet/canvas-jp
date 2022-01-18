export const Color = (h, s, v) => {
  var hex;
  return {
    __type: "Color",
    h: h,
    s: Math.min(1, Math.max(0, s)),
    v: Math.min(1, Math.max(0, v)),
    hex: () => {
      if (!hex) {
        try {
          hex = rgbToHex(hsvToRgb(h, s, v));
        } catch (e) {
          console.log({ h, s, v });
          throw e;
        }
      }
      return hex;
    },
  };
};

Color.mix = (a, b, factor) => {
  return Color(
    a.h * factor + b.h * (1 - factor),
    a.s * factor + b.s * (1 - factor),
    a.v * factor + b.v * (1 - factor)
  );
};

export const Gradient = (colors, angle) => {
  return {
    __type: "Gradient",
    colors,
    angle,
  };
};

export const RadialGradient = (colors, center, radius) => {
  return {
    __type: "RadialGradient",
    colors,
    center,
    radius,
  };
};

export const getColorAverage = (color) => {
  if (color.__type === "Gradient") {
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
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
export function hsvToRgb(h, s, v) {
  var r, g, b;

  var i = Math.floor(h * 6);
  var f = h * 6 - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * https://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
export function rgbToHsv(r, g, b) {
  (r = r / 255), (g = g / 255), (b = b / 255);
  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h,
    s,
    v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, v];
}

// https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

export function rgbToHex([r, g, b]) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

const colorDiff = (a, b) => {
  return (
    Math.abs(a.h - b.h) + Math.abs(a.s - b.s) * 2 + Math.abs(a.v - b.v) * 4
  );
};

export const isColorClose = (a, b, approximation) => {
  return colorDiff(a, b) < approximation;
};

export const black = Color(0, 0, 0);
export const white = Color(0, 0, 1);
export const green = Color(0.25, 1, 1);
export const cyan = Color(0.5, 1, 1);
export const red = Color(0, 1, 0.9);
