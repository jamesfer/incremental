import { BenchmarkRenderer, BenchmarkRunner } from '../run-benchmark';
import { State, Tree } from 'tree-app-incremental-core';
import { defer } from '../utils';

export interface ReorderChildrenBenchmarkOptions {
  childCount: number;
  childDepth: number;
}

class ReorderChildrenBenchmark implements BenchmarkRunner<State> {
  private initialState: State | undefined;
  private readonly childCount: number;
  private readonly childDepth: number;

  constructor({ childCount, childDepth }: ReorderChildrenBenchmarkOptions) {
    this.childCount = childCount;
    this.childDepth = childDepth;
  }

  async initialize(renderer: BenchmarkRenderer<State>) {
    const initialState = this.generateState().state;
    this.initialState = initialState;

    // Render once with the initial state
    renderer.mount(initialState);
    await renderer.waitForRender();

    // We need to wait once more because of the way react works
    await defer();
  }

  async run(renderer: BenchmarkRenderer<State>): Promise<void> {
    if (!this.initialState) {
      throw new Error('Called run before initialize');
    }

    const { id, startIndex, endIndex } = this.generateSwap(this.initialState);
    renderer.update((controller) => {
      controller.moveChild(id, startIndex, endIndex);
    });
    await renderer.waitForRender();
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

  private generateState(): { tree: Tree, state: State } {
    const tree = this.generateTree('1', 'root');
    const treeChildren = [[tree]];
    const state = {
      treeRelations: {},
      trees: { [tree.id]: tree },
    };
    for (let d = 0; d < this.childDepth; d++) {
      // For each previous child create more children
      for (let i = 0; i < treeChildren[d].length; i++) {
        const children = this.generateChildren(this.childCount);
        // Add the children to the tree
        Object.assign(state.trees, children);
        // Add the children to their parent
        Object.assign(state.treeRelations, { [treeChildren[d][i].id]: Object.keys(children) });
        // Add the children to the level array
        treeChildren[d + 1] = treeChildren[d + 1] || [];
        treeChildren[d + 1].push(...Object.values(children));
      }
    }
    return { tree, state };
  }


  private generateChildren(childCount: number): { [k: string]: Tree } {
    const trees: { [k: string]: Tree } = {};
    for (let i = 0; i < childCount; i++) {
      const tree = this.generateTree();
      trees[tree.id] = tree;
    }
    return trees;
  }

  private generateTree(
    id: string = this.randomString(),
    value: string = this.randomString(),
  ): Tree {
    return { id, value };
  }

  private randomString(): string {
    return (+Math.random().toString().slice(2)).toString(32);
  }
}

export default ReorderChildrenBenchmark;
