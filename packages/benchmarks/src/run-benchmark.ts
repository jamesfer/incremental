import { StateController } from './state-controller';
import { MaybePromise, requireElement } from './utils';

// Create a local variable for requestAnimationFrame because it is overridden in the tests
const raf = window.requestAnimationFrame;

export interface BenchmarkRenderer<S> {
  initialize(): void | (() => void);
  mount(state: S): void;
  update(createNewState: (controller: StateController) => void): void;
  waitForRender(): Promise<void>;
}

export interface BenchmarkRunner<S> {
  initialize(renderer: BenchmarkRenderer<S>): MaybePromise<void | (() => void)>;
  run(renderer: BenchmarkRenderer<S>): Promise<void>;
}

function createContainer(): HTMLElement {
  const testbed = requireElement('#testbed');
  const container = document.createElement('div');
  testbed.appendChild(container);
  return container;
}

function removeContainer(container: HTMLElement) {
  container.remove();
}

async function runBenchmarkIteration<S>(
  rendererConstructor: (container: HTMLElement) => BenchmarkRenderer<S>,
  runner: BenchmarkRunner<S>,
): Promise<number> {
  const container = createContainer();
  const renderer = rendererConstructor(container);

  const rendererCleanup = renderer.initialize();
  const runnerCleanup = await runner.initialize(renderer);

  const start = performance.now();
  await runner.run(renderer);
  const end = performance.now();

  if (runnerCleanup) {
    runnerCleanup();
  }
  if (rendererCleanup) {
    rendererCleanup();
  }
  removeContainer(container);

  return end - start;
}

function waitForRaf(cb: () => Promise<any> | void) {
  return new Promise((resolve) => {
    raf(async () => {
      await cb();
      resolve();
    });
  });
}

async function runBenchmark<S>(
  rendererConstructor: (container: HTMLElement) => BenchmarkRenderer<S>,
  runner: BenchmarkRunner<S>,
) {
  // Warm-up
  for (let i = 0; i < 20; i++) {
    await waitForRaf(() => runBenchmarkIteration(rendererConstructor, runner));
  }

  // Benchmark
  const times: number[] = [];
  for (let i = 0; i < 100; i++) {
    await waitForRaf(async () => {
      times.push(await runBenchmarkIteration(rendererConstructor, runner))
    });
  }
  return times;
}

export default runBenchmark;

