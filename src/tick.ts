let then: number;

export const initTick = (): void => {
  then = performance.now();
};

export const tick = () =>
  new Promise<undefined>((resolve) => {
    const now = performance.now();
    const diff = 16.7 - (now - then);
    then = now;
    if (diff > 0.1) {
      setTimeout(() => resolve(undefined), diff);
    } else {
      requestAnimationFrame(() => resolve(undefined));
    }
  });
