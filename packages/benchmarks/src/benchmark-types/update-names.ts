import { State } from 'tree-app-incremental-core';
import { BenchmarkRenderer, BenchmarkRunner } from '../run-benchmark';
import { generateState, randomString } from '../state-utils';

export interface UpdateNamesBenchmarkOptions {
  childCount: number;
  childDepth: number;
}

class UpdateNamesBenchmark implements BenchmarkRunner<State> {
  private readonly initialState: State;
  private readonly childCount: number;
  private readonly childDepth: number;

  constructor({ childCount, childDepth }: UpdateNamesBenchmarkOptions) {
    this.childCount = childCount;
    this.childDepth = childDepth;
    this.initialState = generateState(childDepth, childCount).state;
  }

  async initialize(renderer: BenchmarkRenderer<State>) {
    renderer.mount(this.initialState);
  }

  tick(renderer: BenchmarkRenderer<State>) {
    const { id, name } = this.generateNewName(this.initialState);
    renderer.update((controller) => {
      controller.setName(id, name);
    });
  }

  private generateNewName(state: State): { id: string, name: string } {
    const ids = Object.keys(state.trees);
    return {
      id: ids[this.randomInt(ids.length)],
      name: randomString(),
    };
  }

  private randomInt(max: number) {
    return Math.floor(Math.random() * max);
  }
}

export default UpdateNamesBenchmark;
