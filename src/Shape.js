export const Shape = (points, fill = null, stroke = null) => {
  return {
    __type: "Shape",
    points: points,
    fill: fill
      ? fill.color
        ? fill
        : {
            color: fill,
          }
      : null,
    stroke: stroke,
  };
};

export const SmoothShape = (
  points,
  smoothness = 1,
  fill = null,
  stroke = null
) => {
  return {
    __type: "SmoothShape",
    points: points,
    smoothness: smoothness,
    fill: fill
      ? fill.color
        ? fill
        : {
            color: fill,
          }
      : null,
    stroke: stroke,
  };
};
