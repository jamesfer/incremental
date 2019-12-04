import * as React from 'react';
import { FC, useContext } from 'react';
import { StateContext } from './state';

export interface TreeProps {
  id: string;
}

const Tree: FC<TreeProps> = ({ id }) => {
  const state = useContext(StateContext);
  const tree = state.trees[id];
  const childIds = state.treeRelations[id] || [];

  return (
    <div>
      <strong>{tree.value}</strong>
      {childIds.length > 0 && (
        <ul>
          {childIds.map(id => (
            <li key={id}>
              <Tree id={id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Tree;
