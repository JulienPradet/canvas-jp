export const edgesFromPoints = (points, excludingIndexes) => {
  const edges = [];
  for (let i = 0; i < points.length; i++) {
    if (excludingIndexes.includes(i)) {
      continue;
    }
    const start = points[i % points.length];
    const end = points[(i + 1) % points.length];
    edges.push({ start, end });
  }
  return edges;
};
