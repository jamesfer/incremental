import * as React from 'react';
import { FC, useCallback, memo } from 'react';
import { useSelector } from './useSelector';

export interface TreeProps {
  id: string;
}

const empty: any[] = [];

const Tree: FC<TreeProps> = memo(({ id }) => {
  const tree = useSelector(useCallback(state => state.trees[id], [id]));
  const childIds = useSelector(useCallback(state => state.treeRelations[id] || empty, [id]));

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
});

export default Tree;
