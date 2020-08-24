import * as React from 'react';
import { FC, useCallback } from 'react';
import { useSelector } from './useSelector';

export interface TreeProps {
  id: string;
}

const Tree: FC<TreeProps> = ({ id }) => {
  const tree = useSelector(useCallback(state => state.trees[id], [id]));
  const childIds = useSelector(useCallback(state => state.treeRelations[id] || [], [id]));

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
