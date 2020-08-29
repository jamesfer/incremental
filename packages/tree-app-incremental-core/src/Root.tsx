import { createElement, FunctionComponent, ReadableStore } from 'incremental';
import { State } from './state';
import tree from './Tree';

const root = (store: ReadableStore<State>): FunctionComponent => {
  const Tree = tree(store);
  return () => {
    return <Tree id={'1' as any} />;
  };
};

export default root;
