// from https://github.com/component/ease/blob/master/index.js
// but with esmodules and types

// The MIT License

// Copyright (c) 2010-2012 Tween.js authors.

// Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

export const linear = function (n: number): number {
  return n;
};

export const inQuad = function (n: number): number {
  return n * n;
};

export const outQuad = function (n: number): number {
  return n * (2 - n);
};

export const inOutQuad = function (n: number): number {
  n *= 2;
  if (n < 1) return 0.5 * n * n;
  return -0.5 * (--n * (n - 2) - 1);
};

export const inCube = function (n: number): number {
  return n * n * n;
};

export const outCube = function (n: number): number {
  return --n * n * n + 1;
};

export const inOutCube = function (n: number): number {
  n *= 2;
  if (n < 1) return 0.5 * n * n * n;
  return 0.5 * ((n -= 2) * n * n + 2);
};

export const inQuart = function (n: number): number {
  return n * n * n * n;
};

export const outQuart = function (n: number): number {
  return 1 - --n * n * n * n;
};

export const inOutQuart = function (n: number): number {
  n *= 2;
  if (n < 1) return 0.5 * n * n * n * n;
  return -0.5 * ((n -= 2) * n * n * n - 2);
};

export const inQuint = function (n: number): number {
  return n * n * n * n * n;
};

export const outQuint = function (n: number): number {
  return --n * n * n * n * n + 1;
};

export const inOutQuint = function (n: number): number {
  n *= 2;
  if (n < 1) return 0.5 * n * n * n * n * n;
  return 0.5 * ((n -= 2) * n * n * n * n + 2);
};

export const inSine = function (n: number): number {
  return 1 - Math.cos((n * Math.PI) / 2);
};

export const outSine = function (n: number): number {
  return Math.sin((n * Math.PI) / 2);
};

export const inOutSine = function (n: number): number {
  return 0.5 * (1 - Math.cos(Math.PI * n));
};

export const inExpo = function (n: number): number {
  return 0 == n ? 0 : Math.pow(1024, n - 1);
};

export const outExpo = function (n: number): number {
  return 1 == n ? n : 1 - Math.pow(2, -10 * n);
};

export const inOutExpo = function (n: number): number {
  if (0 == n) return 0;
  if (1 == n) return 1;
  if ((n *= 2) < 1) return 0.5 * Math.pow(1024, n - 1);
  return 0.5 * (-Math.pow(2, -10 * (n - 1)) + 2);
};

export const inCirc = function (n: number): number {
  return 1 - Math.sqrt(1 - n * n);
};

export const outCirc = function (n: number): number {
  return Math.sqrt(1 - --n * n);
};

export const inOutCirc = function (n: number): number {
  n *= 2;
  if (n < 1) return -0.5 * (Math.sqrt(1 - n * n) - 1);
  return 0.5 * (Math.sqrt(1 - (n -= 2) * n) + 1);
};

export const inBack = function (n: number): number {
  var s = 1.70158;
  return n * n * ((s + 1) * n - s);
};

export const outBack = function (n: number): number {
  var s = 1.70158;
  return --n * n * ((s + 1) * n + s) + 1;
};

export const inOutBack = function (n: number): number {
  var s = 1.70158 * 1.525;
  if ((n *= 2) < 1) return 0.5 * (n * n * ((s + 1) * n - s));
  return 0.5 * ((n -= 2) * n * ((s + 1) * n + s) + 2);
};

export const inBounce = function (n: number): number {
  return 1 - outBounce(1 - n);
};

export const outBounce = function (n: number): number {
  if (n < 1 / 2.75) {
    return 7.5625 * n * n;
  } else if (n < 2 / 2.75) {
    return 7.5625 * (n -= 1.5 / 2.75) * n + 0.75;
  } else if (n < 2.5 / 2.75) {
    return 7.5625 * (n -= 2.25 / 2.75) * n + 0.9375;
  } else {
    return 7.5625 * (n -= 2.625 / 2.75) * n + 0.984375;
  }
};

export const inOutBounce = function (n: number): number {
  if (n < 0.5) return inBounce(n * 2) * 0.5;
  return outBounce(n * 2 - 1) * 0.5 + 0.5;
};

export const inElastic = function (n: number): number {
  var s,
    a = 0.1,
    p = 0.4;
  if (n === 0) return 0;
  if (n === 1) return 1;
  if (!a || a < 1) {
    a = 1;
    s = p / 4;
  } else s = (p * Math.asin(1 / a)) / (2 * Math.PI);
  return -(
    a *
    Math.pow(2, 10 * (n -= 1)) *
    Math.sin(((n - s) * (2 * Math.PI)) / p)
  );
};

export const outElastic = function (n: number): number {
  var s,
    a = 0.1,
    p = 0.4;
  if (n === 0) return 0;
  if (n === 1) return 1;
  if (!a || a < 1) {
    a = 1;
    s = p / 4;
  } else s = (p * Math.asin(1 / a)) / (2 * Math.PI);
  return a * Math.pow(2, -10 * n) * Math.sin(((n - s) * (2 * Math.PI)) / p) + 1;
};

export const inOutElastic = function (n: number): number {
  var s,
    a = 0.1,
    p = 0.4;
  if (n === 0) return 0;
  if (n === 1) return 1;
  if (!a || a < 1) {
    a = 1;
    s = p / 4;
  } else s = (p * Math.asin(1 / a)) / (2 * Math.PI);
  if ((n *= 2) < 1)
    return (
      -0.5 *
      (a * Math.pow(2, 10 * (n -= 1)) * Math.sin(((n - s) * (2 * Math.PI)) / p))
    );
  return (
    a *
      Math.pow(2, -10 * (n -= 1)) *
      Math.sin(((n - s) * (2 * Math.PI)) / p) *
      0.5 +
    1
  );
};
