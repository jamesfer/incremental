import FirstRenderBenchmark, { FirstRenderBenchmarkOptions } from './benchmark-types/first-render';
import ReorderChildrenBenchmark, { ReorderChildrenBenchmarkOptions } from './benchmark-types/reorder-children';
import UpdateNamesBenchmark, { UpdateNamesBenchmarkOptions } from './benchmark-types/update-names';
import IncrementalBenchmarkRenderer from './renderer-types/incremental';
import ReactBenchmarkRenderer from './renderer-types/react';
import runBenchmark, { BenchmarkRenderer, BenchmarkRunner } from './run-benchmark';

export interface BenchmarkOptions {
  firstRender: FirstRenderBenchmarkOptions;
  updateNames: UpdateNamesBenchmarkOptions;
  reorderChildren: ReorderChildrenBenchmarkOptions;
}

export interface RendererOptions {
  incremental: void;
  react: void;
}

export type RendererType = keyof RendererOptions;

export type BenchmarkType = keyof BenchmarkOptions;

export interface BenchmarkResults {
  times: number[];
  average: number;
  deviation: number;
}

function constructRenderer(
  rendererType: keyof RendererOptions,
): (container: HTMLElement) => BenchmarkRenderer<any> {
  switch (rendererType) {
    case 'incremental':
      return container => new IncrementalBenchmarkRenderer(container);

    case 'react':
      return container => new ReactBenchmarkRenderer(container);

    default:
      throw new Error(`Unrecognized renderer type ${rendererType}`);
  }
}

function constructBenchmark<B extends keyof BenchmarkOptions>(
  benchmarkType: B,
  options: BenchmarkOptions[B],
): BenchmarkRunner<any> {
  switch (benchmarkType) {
    case 'firstRender':
      return new FirstRenderBenchmark(options);

    case 'updateNames':
      return new UpdateNamesBenchmark(options);

    case 'reorderChildren':
      return new ReorderChildrenBenchmark(options);

    default:
      throw new Error(`Unrecognized benchmark type ${benchmarkType}`);
  }
}

function mean(numbers: number[]) {
  return numbers.reduce((a, b) => a + b, 0) / numbers.length;
}

function computeResults(times: number[]): BenchmarkResults {
  const average = mean(times);
  const deviation = mean(times.map(time => Math.abs(average - time)));
  return { times, average, deviation };
}

async function pickBenchmark<B extends BenchmarkType>(
  rendererType: RendererType,
  benchmarkType: B,
  options: BenchmarkOptions[B],
) {
  const renderer = constructRenderer(rendererType);
  const runner = constructBenchmark(benchmarkType, options);
  const times = await runBenchmark(renderer, runner);
  return computeResults(times);
}

export default pickBenchmark;
