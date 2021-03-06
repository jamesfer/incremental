import { State } from 'tree-app-incremental-core';

export interface StateController {
  setName(id: string, name: string): void;
  moveChild(id: string, startIndex: number, endIndex: number): void;
  overwrite(newState: State): void;
}
