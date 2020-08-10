import { App } from './app';
import { ReadableStore } from './readableStore';
import { setPath, updatePath } from './utils';

export function setAt<S, K1 extends keyof S>(transaction: Transaction<S>, path: [K1], value: S[K1]): void;
export function setAt<S, K1 extends keyof S, K2 extends keyof S[K1]>(transaction: Transaction<S>, path: [K1, K2], value: S[K1][K2]): void;
export function setAt<S, K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2]>(transaction: Transaction<S>, path: [K1, K2, K3], value: S[K1][K2][K3]): void;
export function setAt<S>(transaction: Transaction<S>, path: string[], value: any): void {
  transaction.setState((setPath as any)(transaction.state as any, path, value));
  transaction.registerChange(path);
}

export function appendAt<S, K1 extends keyof S>(transaction: Transaction<S>, path: [K1], value: S[K1] extends (infer E)[] ? E : never): void;
export function appendAt<S, K1 extends keyof S, K2 extends keyof S[K1]>(transaction: Transaction<S>, path: [K1, K2], value: S[K1][K2] extends (infer E)[] ? E : never): void;
export function appendAt<S>(transaction: Transaction<S>, path: string[], value: any): void {
  transaction.setState((updatePath as any)(transaction.state as any, path, (array: any[]) => {
    return [...array, value];
  }));
  transaction.registerChange(path);
}

export function removeAt<S, K1 extends keyof S>(transaction: Transaction<S>, path: [K1], index: S[K1] extends any[] ? number : never): void;
export function removeAt<S, K1 extends keyof S, K2 extends keyof S[K1]>(transaction: Transaction<S>, path: [K1, K2], index: S[K1][K2] extends any[] ? number : never): void;
export function removeAt<S, K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2]>(transaction: Transaction<S>, path: [K1, K2, K3], index: S[K1][K2][K3] extends any[] ? number : never): void;
export function removeAt<S>(transaction: Transaction<S>, path: string[], index: number): void {
  transaction.setState((updatePath as any)(transaction.state as any, path, (array: any[]) => {
    return [...array.slice(0, index), ...array.slice(index + 1)];
  }));
  transaction.registerChange(path);
}

export function changeAt<S, K1 extends keyof S>(transaction: Transaction<S>, path: [K1], operator: (value: S[K1]) => S[K1]): void;
export function changeAt<S, K1 extends keyof S, K2 extends keyof S[K1]>(transaction: Transaction<S>, path: [K1, K2], operator: (value: S[K1][K2]) => S[K1][K2]): void;
export function changeAt<S, K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2]>(transaction: Transaction<S>, path: [K1, K2, K3], operator: (value: S[K1][K2][K3]) => S[K1][K2][K3]): void;
export function changeAt<S>(transaction: Transaction<S>, path: string[], operator: (value: any) => any) {
  transaction.setState((updatePath as any)(transaction.state as any, path, operator));
  transaction.registerChange(path);
}

export class Transaction<S> {
  private changes: (string | number)[][] = [];

  constructor(public state: S) {}

  registerChange(path: (string | number)[]): void {
    this.changes.push(path);
  }

  getChanges(): (string | number)[][] {
    return this.changes;
  }

  setState(state: S): void {
    this.state = state;
  }
}

export class TrackedStore<S> implements ReadableStore<S> {
  public readonly _class = 'IncrementalStore';
  private state: S;
  private app: App | undefined;

  constructor(initialState: S) {
    this.state = initialState;
  }

  attach(app: App): void {
    this.app = app;
  }

  change(operation: (transaction: Transaction<S>) => void): void {
    const transaction = new Transaction<S>(this.state);
    operation(transaction);
    this.state = transaction.state;
    if (this.app) {
      const app = this.app;
      transaction.getChanges().forEach((path) => {
        app.invalidate({ path });
      });
    }
  }

  getState(): S {
    return this.state;
  }
}


