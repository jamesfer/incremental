import { Store } from 'incremental';
export interface State {
    trees: {
        [k: string]: Tree;
    };
    treeRelations: {
        [k: string]: string[];
    };
}
export interface Tree {
    id: string;
    value: string;
}
declare const store: Store<State>;
export default store;
//# sourceMappingURL=store.d.ts.map