export interface State {
  trees: { [k: string]: Tree };
  treeRelations: { [k: string]: string[] };
}

export interface Tree {
  id: string;
  value: string;
}
