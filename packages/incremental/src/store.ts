import produce, { Patch } from 'immer';
import { App } from './app';
import { ReadableStore } from './readableStore';

export class Store<S> implements ReadableStore<S> {
  public readonly _class = 'IncrementalStore';
  private state: S;
  private boundOnPatch = this.onPatch.bind(this);
  private app: App | undefined;

  constructor(initialState: S) {
    this.state = initialState;
  }

  attach(app: App): void {
    this.app = app;
  }

  change(operation: (state: S) => void) {
    this.state = produce(
      this.state,
      operation,
      this.boundOnPatch,
    );
  }

  getState(): S {
    return this.state;
  }

  private onPatch(patches: Patch[]): void {
    const app = this.app;
    if (app) {
      patches.forEach(({ path }) => {
        app.invalidate({ path });
      });
    }
  }
}
