import { Store } from "./store";
import { isStore } from './storeUtils';
import { getPath } from './utils';
import { ReadableStore } from './readableStore';

export interface Reference<S> {
  path: (string | number)[];
}

export interface ComputedValue<S> {
  references: Reference<S>[];
  value: () => any;
}


export function get<S, K1 extends keyof S>(value: ComputedValue<S> | ReadableStore<S>, keys: [K1]): ComputedValue<S>; // S[K1] | undefined;
export function get<S, K1 extends keyof S, K2 extends keyof S[K1]>(value: ComputedValue<S> | ReadableStore<S>, keys: [K1, K2]): ComputedValue<S>; // S[K1][K2] | undefined;
export function get<S, K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2]>(value: ComputedValue<S> | ReadableStore<S>, keys: [K1, K2, K3]): ComputedValue<S>; // S[K1][K2][K3] | undefined;
export function get<S>(ref: ComputedValue<S> | ReadableStore<S>, keys: string[]): ComputedValue<S> {
  if (isStore(ref)) {
    const reference: Reference<S> = { path: keys };
    return {
      references: [reference],
      value: () => getPath(ref.getState(), reference.path as any),
    };
  }

  return {
    references: ref.references,
    value: () => getPath(ref.value(), keys as any),
  };
}

export function map<S>(ref: ComputedValue<S>, operation: (value: any) => any): ComputedValue<S> {
  return {
    references: ref.references,
    value: () => operation(ref.value()),
  };
}
