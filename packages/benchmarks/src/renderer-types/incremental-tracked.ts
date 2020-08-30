import { setAt, App, createElement, TrackedStore, changeAt } from 'incremental';
import { root, State } from 'tree-app-incremental-core';
import { BenchmarkRenderer } from '../run-benchmark';
import { StateController } from '../state-controller';

class IncrementalTrackedStateController implements StateController {
  constructor(private store: TrackedStore<State>) {}

  overwrite(newState: State) {
    this.store.change((transaction) => {
      setAt(transaction, ['trees'], newState.trees);
      setAt(transaction, ['treeRelations'], newState.treeRelations);
    });
  }

  setName(id: string, name: string) {
    this.store.change((transaction) => {
      setAt(transaction, ['trees', id, 'value'], name);
    });
  }

  moveChild(id: string, startIndex: number, endIndex: number): void {
    if (startIndex === endIndex) {
      return;
    }

    this.store.change((transaction) => {
      changeAt(transaction, ['treeRelations', id], (relations) => {
        const output = [...relations];
        output.splice(endIndex, 0, ...output.splice(startIndex, 1));
        return output;
      });
    });
  }
}

class IncrementalTrackedBenchmarkRenderer implements BenchmarkRenderer<State> {
  private stateController: IncrementalTrackedStateController | undefined;

  constructor(private container: HTMLElement) {}

  initialize(): () => void {
    return () => {};
  }

  mount(state: State) {
    if (this.stateController) {
      throw new Error('Called mount twice');
    }

    const store = new TrackedStore<State>(state);
    const Root = root(store);
    const app = new App(this.container, createElement(Root));
    store.attach(app);
    app.start();
    this.stateController = new IncrementalTrackedStateController(store);
  }

  update(createNewState: (controller: StateController) => void): void {
    if (!this.stateController) {
      throw new Error('Called update before mount');
    }

    createNewState(this.stateController);
  }
}

export default IncrementalTrackedBenchmarkRenderer;
