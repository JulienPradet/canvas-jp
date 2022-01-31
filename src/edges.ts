import { CanvasJpPoint } from "./Point";

export type CanvasJpEdge = { start: CanvasJpPoint; end: CanvasJpPoint };

export const edgesFromPoints = (
  points: CanvasJpPoint[],
  excludingIndexes: number[]
): CanvasJpEdge[] => {
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
