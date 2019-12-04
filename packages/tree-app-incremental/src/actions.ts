import store from './store';

export function createTree(id: string, value: string) {
  store.change((state) => {
    state.trees[id] = { id, value };
  });
}

export function addChild(parentId: string, childId: string) {
  store.change((state) => {
    if (state.treeRelations[parentId]) {
      state.treeRelations[parentId].push(childId);
    } else {
      state.treeRelations[parentId] = [childId];
    }
  });
}
