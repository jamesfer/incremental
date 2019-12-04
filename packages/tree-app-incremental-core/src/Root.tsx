import { Store, createElement, FunctionComponent } from 'incremental';
import { State } from './state';
import tree from './Tree';

const root = (store: Store<State>): FunctionComponent => {
  const Tree = tree(store);
  return () => {
    return <Tree id="1"/>;
  };
};

export default root;
