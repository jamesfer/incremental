import { createElement } from 'react';
import { render } from 'react-dom';
import { Root, RootProps, State } from 'tree-app-react-core';
import { BenchmarkRenderer } from '../run-benchmark';
import { StateController } from '../state-controller';
import { defer } from '../utils';

class ReactStateController implements StateController {
  private state: State;

  constructor(initialState: State, private dispatch: (state: State) => void) {
    this.state = initialState;
  }

  setName(id: string, value: string): void {
    this.state = {
      ...this.state,
      trees: {
        ...this.state.trees,
        [id]: { id, value },
      },
    };
    this.dispatch(this.state);
  }

  moveChild(id: string, startIndex: number, endIndex: number): void {
    if (startIndex === endIndex) {
      return;
    }

    const children = [...this.state.treeRelations[id]];
    children.splice(endIndex, 0, ...children.splice(startIndex, 1));
    this.state = {
      ...this.state,
      treeRelations: {
        ...this.state.treeRelations,
        [id]: children,
      }
    };
    this.dispatch(this.state);
  }
}

class ReactBenchmarkRenderer implements BenchmarkRenderer<State> {
  private mounted: boolean = false;
  private stateController: undefined | ReactStateController;

  constructor(private container: HTMLElement) {}

  initialize(): () => void {
    const originalRaf = window.requestAnimationFrame;
    const originalCaf = window.cancelAnimationFrame;

    window.requestAnimationFrame = (cb) => {
      return setTimeout(cb, 0);
    };
    window.cancelAnimationFrame = (id) => {
      clearTimeout(id);
    };

    return () => {
      window.requestAnimationFrame = originalRaf;
      window.cancelAnimationFrame = originalCaf;
    };
  }

  mount(initialState: State) {
    if (this.mounted) {
      throw new Error('Called render twice');
    }

    const element = createElement(Root, {
      initialState,
      reducer: (_, action) => action,
      dispatchCallback: (dispatch) => {
        this.stateController = new ReactStateController(initialState, dispatch);
      },
    });
    render(element, this.container);
    this.mounted = true;
  }

  update(createNewState: (controller: StateController) => void) {
    if (!this.mounted) {
      throw new Error('Called update before render');
    }

    if (!this.stateController) {
      throw new Error('Called update a second time before first render has completed');
    }

    createNewState(this.stateController);
  }

  async waitForRender(): Promise<void> {
    await defer();
  }
}

export default ReactBenchmarkRenderer;
