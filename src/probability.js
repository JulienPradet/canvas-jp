export const normalizeProbability = (types) => {
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

export const getWithProbability = (types, amount) => {
  const numberOfTypes = Object.keys(types).length;
  const selected = Object.values(types).reduce(
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
  return selected.element;
};
