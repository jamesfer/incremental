import { StateController } from './state-controller';
import { MaybePromise, requireElement, waitForRaf } from './utils';

export interface BenchmarkRenderer<S> {
  initialize(): void | (() => void);
  mount(state: S): void;
  update(createNewState: (controller: StateController) => void): void;
}

export interface BenchmarkRunner<S> {
  initialize(renderer: BenchmarkRenderer<S>, frames: number): MaybePromise<void | (() => void)>;
  tick(renderer: BenchmarkRenderer<S>, index: number): void;
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
  const frames = 400;
  const container = createContainer();
  const renderer = rendererConstructor(container);

  const rendererCleanup = renderer.initialize();
  const runnerCleanup = await runner.initialize(renderer, frames);
  await new Promise(res => setTimeout(res, 100));

  const start = performance.now();
  const times = Array(frames);
  for (let i = 0; i < frames; i++) {
    const frameStart = performance.now();
    await waitForRaf(() => runner.tick(renderer, i));
    const frameEnd = performance.now();
    times[i] = frameEnd - frameStart;
  }
  const end = performance.now();
  console.log(times);

  if (runnerCleanup) {
    runnerCleanup();
  }
  if (rendererCleanup) {
    rendererCleanup();
  }
  removeContainer(container);

  return end - start;
}

function runBenchmark<S>(
  rendererConstructor: (container: HTMLElement) => BenchmarkRenderer<S>,
  runner: BenchmarkRunner<S>,
): Promise<number> {
  return runBenchmarkIteration(rendererConstructor, runner);
}

export default runBenchmark;

