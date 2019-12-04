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

export function getKey<S, K extends keyof S>(value: S, key: K): S[K] | undefined {
  return value != null ? (value as any)[key] : value;
}

export function getPath<S, K1 extends keyof S>(value: S, keys: [K1]): S[K1] | undefined;
export function getPath<S, K1 extends keyof S, K2 extends keyof S[K1]>(value: S, keys: [K1, K2]): S[K1][K2] | undefined;
export function getPath<S, K1 extends keyof S, K2 extends keyof S[K1], K3 extends keyof S[K1][K2]>(value: S, keys: [K1, K2, K3]): S[K1][K2][K3] | undefined;
export function getPath<S>(value: S, keys: string[]): any {
  return keys.reduce(getKey as any, value);
}

export function assertNever(x: never): never {
  throw new Error('assertNever: This function should never be called');
}

export function assertType<T>(value: T): void {}
