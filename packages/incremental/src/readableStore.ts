export interface ReadableStore<S> {
  readonly _class: 'IncrementalStore';

  getState(): S;
}
