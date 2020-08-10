import pickBenchmark, { BenchmarkResults, BenchmarkType, RendererType } from './pick-benchmark';
import { requireElement } from './utils';

const renderers: RendererType[] = ['incremental', 'incrementalTracked', 'react'];

const counts: [number, number][] = [
  [3, 2],
  [3, 3],
  [10, 2],
  [4, 4],
  [10, 3],
  [8, 4],
  [10, 4],
];

function attachBenchmarkListener(id: string, callback: () => Promise<void>) {
  const button = requireElement(id);
  button.addEventListener('click', async () => {
    await callback();
    // if (button.parentNode) {
    //   button.parentNode.append(`${average.toFixed(2)}±${deviation.toFixed(2)}`);
    // }
    // console.log(id, times);
  });
}


for (const type of renderers) {
  // for (const [childCount, childDepth] of counts) {
  //   attachBenchmarkListener(`#${type}-first-render-${childCount}-${childDepth}`, () => (
  //     pickBenchmark(type, 'firstRender', { childCount, childDepth })
  //   ));
  // }
  //
  // for (const [childCount, childDepth] of counts) {
  //   attachBenchmarkListener(`#${type}-update-names-${childCount}-${childDepth}`, () => (
  //     pickBenchmark(type, 'updateNames', { childCount, childDepth })
  //   ));
  // }
  //
  // for (const [childCount, childDepth] of counts) {
  //   attachBenchmarkListener(`#${type}-reorder-children-${childCount}-${childDepth}`, () => (
  //     pickBenchmark(type, 'reorderChildren', { childCount, childDepth })
  //   ));
  // }
}

// function setButtonsDisabled(disabled: boolean) {
//   document.querySelectorAll('button.benchmark').forEach((element) => {
//     (element as HTMLButtonElement).disabled = disabled;
//   });
// }

function generateChildCounts(): { childCount: number, childDepth: number, total: number, leaves: number }[] {
  const childCounts = Array(20).fill(0).map((_, i) => i + 2);
  const childDepths = Array(20).fill(0).map((_, i) => i + 2);
  const counts = ([] as any[]).concat(
    ...childCounts.map(childCount => (
      childDepths.map(childDepth => ({
        childCount,
        childDepth,
        leaves: childCount ** childDepth,
        total: Array(childDepth).fill(0).map((_, i) => childCount ** (i + 1)).reduce((a, b) => a + b) + 1,
      })).filter(({ total }) => total <= 1024)
    )),
  );
  counts.sort((a, b) => a.total - b.total);
  return counts;
}

(window as any).generateChildCounts = generateChildCounts;

// interface Result extends BenchmarkResults {
//   childCount: number;
//   childDepth: number;
//   total: number;
//   leaves: number;
// }

// function runAllBenchmarks(type: RendererType): Promise<void> {
//   const counts = generateChildCounts();
//   return counts.reduce<Promise<void>>(
//     async (promise, { childCount, childDepth, total, leaves }, index): Promise<void> => {
//       await promise;
//       await pickBenchmark(type, 'firstRender', { childCount, childDepth });
//
//       // console.log(`${index + 1}/${counts.length}`);
//       // return [...previous, { childCount, childDepth, total, leaves, ...result }];
//     },
//     Promise.resolve(undefined),
//   );
// }
//
// function printCsv(results: Result[]): void {
//   const csv = results.reduce(
//     (string, { total, leaves, times }) => `${string}${total},${leaves},${times.join(',')}\n`,
//     `total, leaves, times\n`,
//   );
//   console.log(csv);
// }
//
// function displayResults(button: Element, results: Result[]): void {
//   if (button.parentNode) {
//     const average = results.reduce((sum, result) => sum + result.average, 0) / results.length;
//     const deviation = results.reduce((sum, result) => sum + result.deviation, 0) / results.length;
//     button.parentNode.append(`${average.toFixed(2)}±${deviation.toFixed(2)}`);
//   }
// }
//
// for (const type of renderers) {
//   const button = requireElement(`#${type}-first-render`);
//   button.addEventListener('click', async () => {
//     setButtonsDisabled(true);
//     await runAllBenchmarks(type);
//     // printCsv(results);
//     // displayResults(button, results);
//     setButtonsDisabled(false);
//   });
// }
