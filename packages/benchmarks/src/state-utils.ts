import { State, Tree } from 'tree-app-incremental-core';

export function generateState(childDepth: number, childCount: number): { tree: Tree, state: State } {
  const tree = generateTree('1', 'root');
  const treeChildren = [[tree]];
  const state = {
    treeRelations: {},
    trees: { [tree.id]: tree },
  };
  for (let d = 0; d < childDepth; d++) {
    // For each previous child create more children
    for (let i = 0; i < treeChildren[d].length; i++) {
      const children = generateChildren(childCount);
      // Add the children to the tree
      Object.assign(state.trees, children);
      // Add the children to their parent
      Object.assign(state.treeRelations, { [treeChildren[d][i].id]: Object.keys(children) });
      // Add the children to the level array
      treeChildren[d + 1] = treeChildren[d + 1] || [];
      treeChildren[d + 1].push(...Object.values(children));
    }
  }
  return { tree, state };
}


export function generateChildren(childCount: number): { [k: string]: Tree } {
  const trees: { [k: string]: Tree } = {};
  for (let i = 0; i < childCount; i++) {
    const tree = generateTree();
    trees[tree.id] = tree;
  }
  return trees;
}

export function generateTree(
  id: string = randomString(),
  value: string = randomString(),
): Tree {
  return { id, value };
}

export function randomString(): string {
  return (+Math.random().toString().slice(2)).toString(32);
}
