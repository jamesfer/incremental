import * as queryString from 'query-string';
import { BenchmarkType, RendererType } from './pick-benchmark';
import { requireElement } from './utils';

const renderers: { title: string, type: RendererType }[] = [
  { title: 'Incremental', type: 'incremental' },
  { title: 'Incremental Tracked', type: 'incrementalTracked' },
  { title: 'React', type: 'react' },
];
const benchmarks: { title: string, type: BenchmarkType }[] = [
  { title: 'First render', type: 'firstRender' },
  { title: 'Update names', type: 'updateNames' },
  { title: 'Reorder children', type: 'reorderChildren' },
];

// const counts: [number, number][] = [
//   [3, 2],
//   [3, 3],
//   [10, 2],
//   [4, 4],
//   [10, 3],
//   [8, 4],
//   [10, 4],
// ];

const counts: [number, number][] = [
  // [ 2, 4 ],  [ 2, 5 ],
  // [ 4, 3 ],  [ 3, 4 ],
  // [ 5, 3 ],  [ 13, 2 ],
  [ 6, 3 ],  [ 4, 4 ],
  [ 7, 3 ],  [ 21, 2 ],
  [ 8, 3 ],  [ 5, 4 ],
  [ 9, 3 ],  [ 4, 5 ],
  [ 6, 4 ],  [ 11, 3 ],
  [ 12, 3 ]
];

function computeTotalNodeCount(childCount: number, childDepth: number): number {
  return Array(childDepth).fill(0).map((_, i) => childCount ** (i + 1)).reduce((a, b) => a + b) + 1;
}

function makeEmptyCountResults(): { [k: number]: number[] } {
  return counts
    .map(([count, depth]) => ({ [computeTotalNodeCount(count, depth)]: [] }))
    .reduce((a, b) => Object.assign(a, b), {});
}

function makeEmptyBenchmarkResults(): { [k in RendererType]: { [k: number]: number[] } } {
  return {
    incremental: makeEmptyCountResults(),
    incrementalTracked: makeEmptyCountResults(),
    react: makeEmptyCountResults(),
  };
}

const allResults: { [k in BenchmarkType]: ReturnType<typeof makeEmptyBenchmarkResults> } = {
  firstRender: makeEmptyBenchmarkResults(),
  updateNames: makeEmptyBenchmarkResults(),
  reorderChildren: makeEmptyBenchmarkResults(),
};

function createElementFromString(string: string) {
  const wrapper = document.createElement('template');
  wrapper.innerHTML = string;
  const firstChild = wrapper.content.firstChild;
  if (!firstChild) {
    throw new Error('No child in html string');
  }
  return firstChild;
}

function nextMessageEvent(): Promise<string> {
  return new Promise<string>((res) => {
    const callback = (message: any) => {
      res(message.data);
      window.removeEventListener('message', callback);
    };
    window.addEventListener('message', callback);
  });
}

function resultComponentId(renderer: RendererType, benchmark: BenchmarkType, childCount: number, childDepth: number): string {
  return `${renderer}-${benchmark}-${childCount}-${childDepth}-results`;
}

async function runBenchmark(renderer: RendererType, benchmark: BenchmarkType, childCount: number, childDepth: number) {
  const parameters = {
    renderer,
    benchmark,
    childCount,
    childDepth,
  };
  console.log('Starting benchmark', parameters);
  window.open(`./run-benchmark.html?${queryString.stringify(parameters)}`);

  const data = JSON.parse(await nextMessageEvent());
  const nodeCount = computeTotalNodeCount(childCount, childDepth);
  allResults[benchmark][renderer][nodeCount].push(data.time);
  console.log('Benchmark finished', parameters, data.time);

  const resultComponent = requireElement(`#${resultComponentId(renderer, benchmark, childCount, childDepth)}`);
  resultComponent.textContent = allResults[benchmark][renderer][nodeCount].map(time => `${(time / 400).toFixed(2)}ms`).join(', ');
}

async function runAllBenchmarks() {
  for (let i = 0; i < 3; i++) {
    for (const benchmark of benchmarks) {
      for (const [childCount, childDepth] of counts) {
        for (const renderer of renderers) {
          await runBenchmark(renderer.type, benchmark.type, childCount, childDepth);
          await new Promise(res => setTimeout(res, 1000));
        }
      }
    }
  }
}

function makeResultsCsv(): string {
  const maxLengths: { [k in RendererType]: number } = { incremental: 0, incrementalTracked: 0, react: 0 };
  for (const benchmark of benchmarks) {
    for (const renderer of renderers) {
      for (const [childCount, childDepth] of counts) {
        maxLengths[renderer.type] = Math.max(maxLengths[renderer.type], allResults[benchmark.type][renderer.type][computeTotalNodeCount(childCount, childDepth)].length);
      }
    }
  }

  let csv = 'Benchmark,Nodes,';
  for (const renderer of renderers) {
    for (let i = 0; i < maxLengths[renderer.type]; i++) {
      csv += `${renderer.title} ${i},`;
    }
  }
  csv += '\n';

  for (const benchmark of benchmarks) {
    for (const [childCount, childDepth] of counts) {
      csv += `${benchmark.title},${computeTotalNodeCount(childCount, childDepth)},`;
      for (const renderer of renderers) {
        const results = allResults[benchmark.type][renderer.type][computeTotalNodeCount(childCount, childDepth)];
        for (let i = 0; i < maxLengths[renderer.type]; i++) {
          if (i < results.length) {
            csv += `${results[i] / 400},`;
          } else {
            csv += ',';
          }
        }
      }
      csv += '\n';
    }
  }

  return csv;
}

function logResultsCsv() {
  console.log(makeResultsCsv());
}

function initialize() {
  const table = requireElement('#benchmark-table');

  table.append(createElementFromString(`<tr class="header-row">
    <th></th>
    <th>Incremental</th>
    <th>Incremental Tracked</th>
    <th>React</th>
  </tr>`));

  for (const benchmark of benchmarks) {
    table.append(createElementFromString(`<tr>
      <th scope="row" colspan="${renderers.length + 1}"><strong>${benchmark.title}</strong></th>
    </tr>`));

    for (const [childCount, childDepth] of counts) {
      const row = createElementFromString(`<tr>
        <th scope="row">${childCount ** childDepth} nodes</th>
      </tr>`);
      table.append(row);

      for (const renderer of renderers) {
        row.appendChild(createElementFromString(`<td>
          <button class="benchmark" onclick="runBenchmark('${renderer.type}', '${benchmark.type}', ${childCount}, ${childDepth})">Start</button>
          <span id="${renderer.type}-${benchmark.type}-${childCount}-${childDepth}-results"></span>
        </td>`))
      }
    }
  }
}

(window as any).runBenchmark = runBenchmark;
(window as any).runAllBenchmarks = runAllBenchmarks;
(window as any).logResultsCsv = logResultsCsv;

initialize();
