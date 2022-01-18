export const distance = (a, b) =>
  Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));

export const distanceFromRotatedAbscissa = (point, angle) => {
  return Math.abs(point.x * Math.sin(-angle) + point.y * Math.cos(-angle));
};
