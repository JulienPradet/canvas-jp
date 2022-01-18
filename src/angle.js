export const angle = (a, b) => Math.atan2(b.y - a.y, b.x - a.x);

export function radToDeg(radians) {
  var pi = Math.PI;
  return radians * (180 / pi);
}
