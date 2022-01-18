export const Line = (start, end, stroke) => {
  return {
    __type: "Line",
    start,
    end,
    stroke,
  };
};

export const SmoothLine = (points, smoothness = 1, stroke = null) => {
  return {
    __type: "SmoothLine",
    points: points,
    smoothness: smoothness,
    stroke: stroke,
  };
};
