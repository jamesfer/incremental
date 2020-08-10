import { App, createElement, Store } from 'incremental';
import { root, State } from 'tree-app-incremental-core';
import { BenchmarkRenderer } from '../run-benchmark';
import { StateController } from '../state-controller';

class IncrementalStateController implements StateController {
  constructor(private store: Store<State>) {}

  overwrite(newState: State) {
    this.store.change((state) => {
      state.trees = newState.trees;
      state.treeRelations = newState.treeRelations;
    });
  }

  setName(id: string, name: string) {
    this.store.change((state) => {
      state.trees[id].value = name;
    });
  }

  moveChild(id: string, startIndex: number, endIndex: number): void {
    if (startIndex === endIndex) {
      return;
    }
    this.store.change((state) => {
      state.treeRelations[id].splice(endIndex, 0, ...state.treeRelations[id].splice(startIndex, 1));
    });
  }
}

class IncrementalBenchmarkRenderer implements BenchmarkRenderer<State> {
  private stateController: IncrementalStateController | undefined;

  constructor(private container: HTMLElement) {}

  initialize(): () => void {
    return () => {};
  }

  mount(state: State) {
    if (this.stateController) {
      throw new Error('Called mount twice');
    }

    const store = new Store<State>(state);
    const Root = root(store);
    const app = new App(this.container, createElement(Root));
    store.attach(app);
    app.start();
    this.stateController = new IncrementalStateController(store);
  }

  update(createNewState: (controller: StateController) => void): void {
    if (!this.stateController) {
      throw new Error('Called update before mount');
    }

    createNewState(this.stateController);
  }
}

export default IncrementalBenchmarkRenderer;
