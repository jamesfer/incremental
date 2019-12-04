import { BenchmarkRenderer, BenchmarkRunner } from '../run-benchmark';
import { State, Tree } from 'tree-app-incremental-core';
import { defer } from '../utils';

export interface UpdateNamesBenchmarkOptions {
  childCount: number;
  childDepth: number;
}

class UpdateNamesBenchmark implements BenchmarkRunner<State> {
  private initialState: State | undefined;
  private readonly childCount: number;
  private readonly childDepth: number;

  constructor({ childCount, childDepth }: UpdateNamesBenchmarkOptions) {
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
    // await new Promise(r => setTimeout(r, 1));
  }

  async run(renderer: BenchmarkRenderer<State>): Promise<void> {
    if (!this.initialState) {
      throw new Error('Called run before initialize');
    }

    const { id, name } = this.generateNewName(this.initialState);
    renderer.update((controller) => {
      controller.setName(id, name);
    });
    await renderer.waitForRender();
    // await new Promise(r => setTimeout(r, 1));
  }

  private generateNewName(state: State): { id: string, name: string } {
    const ids = Object.keys(state.trees);
    return {
      id: ids[this.randomInt(ids.length)],
      name: this.randomString(),
    };
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

export default UpdateNamesBenchmark;
