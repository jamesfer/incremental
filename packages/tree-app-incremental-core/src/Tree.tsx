import { createElement, FunctionComponent, get, map, Store } from 'incremental';
import { State } from './state';

export interface TreeProps {
  id: string;
}

/**
 * This is a component that renders a title in a <strong> tag and a list of child trees.
 * It starts with a function that accepts the global store object because I don't have a way
 * to inject it. In a regular React component, you would probably do this with contexts.
 * We also need to store the component in a variable so that we can refer to it recursively.
 */
const tree = (store: Store<State>): FunctionComponent<TreeProps> => {
  const Tree: FunctionComponent<TreeProps> = ({ key, id }) => {
    // Access a value from the central store. This returns a placeholder value that will be filled
    // with actual value when needed.
    const tree = get(store, ['trees', id]);
    // Access a value from the central store and apply a function to it. Because get() only returns
    // a placeholder, we need to use the map function to perform an operation on the actual value.
    // The map function will be executed whenever part of the component needs to be updated.
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
