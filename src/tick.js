let then;

export const initTick = () => {
  then = performance.now();
};

export const tick = () =>
  new Promise((resolve) => {
    const now = performance.now();
    const diff = 16.7 - (now - then);
    then = now;
    if (diff > 0.1) {
      setTimeout(() => resolve(), diff);
    } else {
      requestAnimationFrame(() => resolve());
    }
  });
