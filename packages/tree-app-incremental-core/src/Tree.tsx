import { createElement, FunctionComponent, get, map, Store } from 'incremental';
import { State } from './state';

export interface TreeProps {
  id: string;
}

const tree = (store: Store<State>): FunctionComponent<TreeProps> => {
  const Tree: FunctionComponent<TreeProps> = ({ key, id }) => {
    const tree = get(store, ['trees', id]);
    const childIds = map(get(store, ['treeRelations', id]), ids => ids || []);
    const title = map(tree, ({ value }) => value);
    return (
      <div key={key}>
        <strong>{title}</strong>
        {map(childIds, (ids: string[]) => ids.length > 0 && (
          <ul>
            {ids.map(id => (
              <li key={id}>
                <Tree id={id} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    );
  };

  return Tree;
};

export default tree;
