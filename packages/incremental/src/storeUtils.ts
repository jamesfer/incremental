import { ReadableStore } from './readableStore';

export function isStore<T = any>(store: unknown): store is ReadableStore<T> {
  return typeof store === 'object' && !!store && (store as ReadableStore<T>)._class === 'IncrementalStore';
}

