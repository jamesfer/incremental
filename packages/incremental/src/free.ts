import { Store } from "./store";
import { isStore } from './storeUtils';
import { getPath } from './utils';
import { ReadableStore } from './readableStore';
import takeWhile from 'lodash-es/takeWhile';
import flatMap from 'lodash-es/flatMap';

export interface Reference<S> {
  path: (string | number)[];
}

export interface ComputedValue<S, V = any> {
  references: Reference<S>[];
  value: () => V;
}


export function get<S, K1 extends keyof S>(value: ComputedValue<S> | ReadableStore<S>, keys: [K1]): ComputedValue<S>; // S[K1] | undefined;
export function get<S, K1 extends keyof S, K2 extends keyof S[K1]>(value: ComputedValue<S> | ReadableStore<S>, keys: [K1, K2]): ComputedValue<S>; // S[K1][K2] | undefined;
export function get<S, K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2]>(value: ComputedValue<S> | ReadableStore<S>, keys: [K1, K2, K3]): ComputedValue<S>; // S[K1][K2][K3] | undefined;
export function get<S>(ref: ComputedValue<S> | ReadableStore<S>, keys: (string | ComputedValue<S, string>)[]): ComputedValue<S> {
  const pathReference: Reference<S> = { path: takeWhile(keys, key => typeof key == 'string') as string[] };
  const computedKeyReferences = flatMap(keys, key => typeof key === 'string' ? [] : key.references);
  const computedPath = (): string[] => keys.map(key => typeof key === 'string' ? key : key.value());
  if (isStore(ref)) {
    return {
      references: [pathReference, ...computedKeyReferences],
      value: () => getPath(ref.getState(), computedPath() as any),
    };
  }

  return {
    references: [...ref.references, pathReference, ...computedKeyReferences],
    value: () => getPath(ref.value(), computedPath() as any),
  };
}

export function map<S, T, V>(ref: ComputedValue<S, T>, operation: (value: T) => V): ComputedValue<S, V> {
  return {
    references: ref.references,
    value: () => operation(ref.value()),
  };
}
