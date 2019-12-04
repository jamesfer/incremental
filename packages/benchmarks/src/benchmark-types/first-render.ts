import { BenchmarkRenderer, BenchmarkRunner } from '../run-benchmark';
import { State, Tree } from 'tree-app-incremental-core';

export interface FirstRenderBenchmarkOptions {
  childCount: number;
  childDepth: number;
}

class FirstRenderBenchmark implements BenchmarkRunner<State> {
  private initialState: State | undefined;
  private readonly childCount: number;
  private readonly childDepth: number;

  constructor({ childCount, childDepth }: FirstRenderBenchmarkOptions) {
    this.childCount = childCount;
    this.childDepth = childDepth;
  }

  initialize() {
    this.initialState = this.generateState().state;
  }

  async run(renderer: BenchmarkRenderer<State>): Promise<void> {
    if (!this.initialState) {
      throw new Error('Called run before initialize');
    }

    renderer.mount(this.initialState);
    await renderer.waitForRender();
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

export default FirstRenderBenchmark;
