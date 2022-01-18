export const Circle = (center, radius, fill = null, stroke = null) => {
  return Arc(center, radius, 0, Math.PI * 2, fill, stroke);
};

export const Arc = (
  center,
  radius,
  startAngle,
  endAngle,
  fill = null,
  stroke = null
) => {
  return {
    __type: "Arc",
    center: center,
    radius,
    startAngle,
    endAngle,
    fill,
    stroke,
  };
};
