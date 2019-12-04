import { Store } from 'incremental';

export interface State {
  trees: { [k: string]: Tree };
  treeRelations: { [k: string]: string[] };
}

export interface Tree {
  id: string;
  value: string;
}

const initialState: State = {
  trees: {
    '1': {
      id: '1',
      value: 'Tree 1',
    },
    '2': {
      id: '2',
      value: 'Child tree 2',
    },
    '3': {
      id: '3',
      value: 'Child tree 3',
    },
  },
  treeRelations: {
    '1': ['2', '3'],
  },
};

const store = new Store(initialState);

export default store;
