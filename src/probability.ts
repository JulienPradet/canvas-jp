interface CanvasJpProbabilityType<T> {
  probability: number;
  factory: T;
}

export interface CanvasJpProbabilities<T> {
  [key: string]: CanvasJpProbabilityType<T>;
}

export const normalizeProbability = <T>(
  types: CanvasJpProbabilities<T>
): CanvasJpProbabilities<T> => {
  const totalProbability = Object.values(types).reduce(
    (acc, { probability }) => acc + probability,
    0
  );
  // mutating types object because I'm lazy
  Object.keys(types).forEach((key) => {
    types[key].probability = types[key].probability / totalProbability;
  });

  return types;
};

export const getWithProbability = <T>(
  types: CanvasJpProbabilities<T>,
  amount: number
): CanvasJpProbabilityType<T> => {
  const numberOfTypes = Object.keys(types).length;
  const selected = Object.values(types).reduce<{
    total: number;
    element: CanvasJpProbabilityType<T> | null;
  }>(
    (result, element, index) => {
      let total = result.total + element.probability;
      if (result.element) {
        return result;
      } else if (total > amount) {
        return { total: total, element };
      } else if (index === numberOfTypes - 1) {
        return { total: total, element };
      } else {
        return { total: total, element: null };
      }
    },
    { total: 0, element: null }
  );
  return selected.element as CanvasJpProbabilityType<T>;
};
