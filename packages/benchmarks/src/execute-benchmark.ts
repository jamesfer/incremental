import * as queryString from 'query-string';
import pickBenchmark from './pick-benchmark';

export interface BenchmarkOptions {
  childCount: number;
  childDepth: number;
}

export type RendererType =
  | 'incremental'
  | 'incrementalTracked'
  | 'react';

export type BenchmarkType =
  | 'firstRender'
  | 'updateNames'
  | 'reorderChildren';

export interface BenchmarkResults {
  times: number[];
  average: number;
  deviation: number;
}

interface SelectedBenchmarkOptions {
  benchmark: BenchmarkType;
  benchmarkOptions: BenchmarkOptions;
  renderer: RendererType;
}

function readSettings(): SelectedBenchmarkOptions {
  const { benchmark, childCount, childDepth, renderer } = queryString.parse(window.location.search);

  if (!benchmark || Array.isArray(benchmark) || !['firstRender', 'updateNames', 'reorderChildren'].includes(benchmark)) {
    throw new Error(`Missing or unrecognized benchmark: ${benchmark}`);
  }

  if (!renderer || Array.isArray(renderer) || !['incremental', 'incrementalTracked', 'react'].includes(renderer)) {
    throw new Error(`Missing or unrecognized renderer: ${renderer}`);
  }

  if (!childCount || Array.isArray(childCount) || Number.isNaN(+childCount)) {
    throw new Error(`Missing or unrecognized child count: ${childCount}`);
  }

  if (!childDepth || Array.isArray(childDepth) || Number.isNaN(+childDepth)) {
    throw new Error(`Missing or unrecognized child depth: ${childDepth}`);
  }

  return {
    renderer: renderer as RendererType,
    benchmark: benchmark as BenchmarkType,
    benchmarkOptions: {
      childCount: +childCount,
      childDepth: +childDepth,
    },
  };
}


async function main() {
  const options = readSettings();

  const time = await pickBenchmark(options.renderer, options.benchmark, options.benchmarkOptions);

  if (window.opener && window.opener.postMessage) {
    (window.opener as Window).postMessage(JSON.stringify({ time }), window.location.origin);
    console.log('Sent Post message');
    window.close();
  }
}

main();
