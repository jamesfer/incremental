import produce, { Patch } from 'immer';
import { App } from './app';

export class Store<S> {
  public readonly _class = 'Store';
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

  static isStore(store: unknown): store is Store<any> {
    return typeof store === 'object' && !!store && (store as Store<any>)._class === 'Store';
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
