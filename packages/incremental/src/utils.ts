import { Reference } from './free';

export interface Dictionary<T> {
  [k: string]: T;
}

export interface NumericDictionary<T> {
  [k: number]: T;
}

export function referencesOverlap<S>(dependent: Reference<S>, dirtyReference: Reference<S>): boolean {
  const length = Math.min(dependent.path.length, dirtyReference.path.length);
  for (let i = 0; i < length; i++) {
    if (dependent.path[i] !== dirtyReference.path[i]) {
      return false;
    }
  }
  return true;
}

export function referenceOverlapsAnyInList<S>(dependent: Reference<S>, dirtyReferences: Reference<S>[]): boolean {
  return dirtyReferences.some(listRef => referencesOverlap(listRef, dependent));
}

export function anyReferencesOverlap<S>(dependents: Reference<S>[], dirtyReferences: Reference<S>[]): boolean {
  return dependents.some(dependent => referenceOverlapsAnyInList(dependent, dirtyReferences));
}

export function getKey<S, K extends keyof S>(value: S, key: K): S[K] | null | undefined {
  return value != null ? (value as any)[key] : value;
}

export function getPath<S, K1 extends keyof S>(value: S, keys: [K1]): S[K1] | undefined;
export function getPath<S, K1 extends keyof S, K2 extends keyof S[K1]>(value: S, keys: [K1, K2]): S[K1][K2] | undefined;
export function getPath<S, K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2]>(value: S, keys: [K1, K2, K3]): S[K1][K2][K3] | undefined;
export function getPath<S>(value: S, keys: string[]): any {
  return keys.reduce(getKey as any, value);
}

export function updatePath<S, K1 extends keyof S>(object: S, keys: [K1], operator: (value: S[K1]) => S[K1]): S;
export function updatePath<S, K1 extends keyof S, K2 extends keyof S[K1]>(object: S, keys: [K1, K2], operator: (value: S[K1][K2]) => S[K1][K2]): S;
export function updatePath<S, K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2]>(object: S, keys: [K1, K2, K3], operator: (value: S[K1][K2][K3]) => S[K1][K2][K3]): S;
export function updatePath<S>(object: S, keys: string[], operator: (value: any) => any): any {
  if (keys.length === 0) {
    return object;
  }

  const lastKey = keys[keys.length - 1];
  const newObject = { ...object };
  const finalLevel = keys.slice(0, -1).reduce((current: any, key) => {
    // Copy the value of the key and mutate the current level
    current[key] = { ...current[key] };
    return current[key];
  }, newObject);
  finalLevel[lastKey] = operator(finalLevel[lastKey]);
  return newObject;
}

export function setPath<S, K1 extends keyof S>(object: S, keys: [K1], value: S[K1]): S;
export function setPath<S, K1 extends keyof S, K2 extends keyof S[K1]>(object: S, keys: [K1, K2], value: S[K1][K2]): S;
export function setPath<S, K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2]>(object: S, keys: [K1, K2, K3], value: S[K1][K2][K3]): S;
export function setPath<S>(object: S, keys: string[], value: any): any {
  return (updatePath as any)(object, keys, () => value);
}

export function assertNever(x: never): never {
  throw new Error('assertNever: This function should never be called');
}

export function assertType<T>(value: T): void {}
