import { State } from 'tree-app-incremental-core';
import { BenchmarkRenderer, BenchmarkRunner } from '../run-benchmark';
import { generateState } from '../state-utils';

export interface FirstRenderBenchmarkOptions {
  childCount: number;
  childDepth: number;
}

class FirstRenderBenchmark implements BenchmarkRunner<State> {
  private readonly emptyState: State = { trees: { 1: { id: '1', value: 'root' } }, treeRelations: {} };
  private populatedStates: State[] = [];
  private isEmpty = true;
  private readonly childCount: number;
  private readonly childDepth: number;

  constructor({ childCount, childDepth }: FirstRenderBenchmarkOptions) {
    this.childCount = childCount;
    this.childDepth = childDepth;
  }

  initialize(renderer: BenchmarkRenderer<State>, frames: number) {
    renderer.mount(this.emptyState);
    this.populatedStates = Array(frames).fill(0).map(() => generateState(this.childDepth, this.childCount).state);
  }

  async tick(renderer: BenchmarkRenderer<State>, index: number): Promise<void> {
    if (this.populatedStates.length === 0) {
      throw new Error('Called run before initialize');
    }

    if (this.isEmpty) {
      renderer.update((state) => {
        state.overwrite(this.populatedStates[index % this.populatedStates.length]);
      });
      this.isEmpty = false;
    } else {
      renderer.update((state) => {
        state.overwrite(this.emptyState);
      });
      this.isEmpty = true;
    }
  }
}

export default FirstRenderBenchmark;
