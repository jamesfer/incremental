export type MaybePromise<T> = T | Promise<T>;

export function requireElement(selector: string) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Cannot find element with selector ${selector}`);
  }
  return element;
}

export function defer(fn?: () => void | Promise<void>): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => Promise.resolve(fn && fn()).then(resolve), 0);
  });
}

export function assertNever(x: never, error?: Error): never {
  if (error) {
    throw error;
  }

  return x;
}

export function waitForRaf<T>(cb: () => T | Promise<T>): Promise<T> {
  return new Promise<T>((resolve) => {
    requestAnimationFrame(async () => {
      resolve(await cb());
    });
  });
}
