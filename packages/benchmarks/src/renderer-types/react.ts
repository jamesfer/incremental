import { createElement } from 'react';
import { render } from 'react-dom';
import { Root, State } from 'tree-app-react-core';
import { BenchmarkRenderer } from '../run-benchmark';
import { StateController } from '../state-controller';

class ReactStateController implements StateController {
  private state: State;

  constructor(initialState: State, private dispatch: (state: State) => void) {
    this.state = initialState;
  }

  overwrite(newState: State) {
    this.state = newState;
    this.dispatch(this.state);
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
    return () => {};
  }

  mount(initialState: State) {
    if (this.mounted) {
      throw new Error('Called mount twice');
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
}

export default ReactBenchmarkRenderer;
