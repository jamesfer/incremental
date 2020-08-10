import { State } from 'tree-app-incremental-core';
import { BenchmarkRenderer, BenchmarkRunner } from '../run-benchmark';
import { generateState } from '../state-utils';

export interface ReorderChildrenBenchmarkOptions {
  childCount: number;
  childDepth: number;
}

class ReorderChildrenBenchmark implements BenchmarkRunner<State> {
  private readonly initialState: State;
  private readonly childCount: number;
  private readonly childDepth: number;

  constructor({ childCount, childDepth }: ReorderChildrenBenchmarkOptions) {
    this.childCount = childCount;
    this.childDepth = childDepth;
    this.initialState = generateState(childDepth, childCount).state;
  }

  async initialize(renderer: BenchmarkRenderer<State>) {
    renderer.mount(this.initialState);
  }

  tick(renderer: BenchmarkRenderer<State>) {
    const { id, startIndex, endIndex } = this.generateSwap(this.initialState);
    renderer.update((controller) => {
      controller.moveChild(id, startIndex, endIndex);
    });
  }

  private generateSwap(state: State): { id: string, startIndex: number, endIndex: number } {
    const ids = Object.keys(state.treeRelations);
    const id = ids[this.randomInt(ids.length)];
    const startIndex = this.randomInt(state.treeRelations[id].length);
    let endIndex;
    do {
      endIndex = this.randomInt(state.treeRelations[id].length);
    } while (endIndex === startIndex);
    return ({ id, startIndex, endIndex });
  }

  private randomInt(max: number) {
    return Math.floor(Math.random() * max);
  }
}

export default ReorderChildrenBenchmark;
