import { createContext } from 'react';

export interface State {
  trees: { [k: string]: Tree };
  treeRelations: { [k: string]: string[] };
}

export interface Tree {
  id: string;
  value: string;
}

export const StateContext = createContext<State>({ trees: {}, treeRelations: {} });
