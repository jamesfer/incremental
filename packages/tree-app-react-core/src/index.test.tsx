// import { cleanup } from '../../tests/utils';
// import { createElement } from '../create-element';
// import { defer } from '../utils';
// import Root from './Root';
// import { State } from './state';
// import { getByText, queryByText } from '@testing-library/dom';
// import { render, unmountComponentAtNode } from 'react-dom';
//
// describe('TreeApp (incremental)', () => {
//   function renderApp(state: State) {
//     render(<Root initialState={state} />, document.body);
//   }
//
//   afterEach(() => {
//     unmountComponentAtNode(document.body);
//     cleanup();
//   });
//
//   describe('when rendering a tree with no children', () => {
//     const treeValue = 'First tree';
//     const state = {
//       treeRelations: {},
//       trees: {
//         '1': {
//           id: '1',
//           value: treeValue,
//         },
//       },
//     };
//
//     beforeEach(() => {
//       renderApp(state);
//     });
//
//     it('displays the tree title in a div', () => {
//       const title = getByText(document.body, treeValue);
//       expect(title.parentNode).toHaveProperty('nodeName', 'DIV');
//     });
//
//     it('does not render another list', () => {
//       expect(document.querySelectorAll('ul')).toHaveLength(0);
//     });
//   });
//
//   describe('when rendering a tree with children', () => {
//     const parentValue = 'First tree';
//     const child1Value = 'First child';
//     const child2Value = 'Second child';
//     const state = {
//       treeRelations: { '1': ['2', '3'] },
//       trees: {
//         '1': {
//           id: '1',
//           value: parentValue,
//         },
//         '2': {
//           id: '2',
//           value: child1Value,
//         },
//         '3': {
//           id: '3',
//           value: child2Value,
//         },
//       },
//     };
//
//     beforeEach(() => {
//       renderApp(state);
//     });
//
//     it('displays a list for the children as a child of the div', () => {
//       const ul = document.querySelector('ul');
//       const parentTextElement = getByText(document.body, parentValue);
//       expect(ul!.parentNode).toBe(parentTextElement.parentNode);
//     });
//
//     it.each<[number, string]>([
//       [1, child1Value],
//       [2, child2Value],
//     ])('displays the child %d in an li element', (_, text) => {
//       const child = getByText(document.body, text);
//       expect(child.parentNode!.parentNode).toHaveProperty('nodeName', 'LI');
//     });
//   });
//
//   describe('when a child is added', () => {
//     const firstChildValue = '456';
//     const newChildValue = 'new value';
//     const state = {
//       treeRelations: { '1': ['2'] },
//       trees: {
//         '1': {
//           id: '1',
//           value: '123',
//         },
//         '2': {
//           id: '2',
//           value: firstChildValue,
//         },
//       },
//     };
//
//     beforeEach(async () => {
//       const { store } = renderApp(state);
//       await defer(async () => {
//         store.change((state) => {
//           state.trees['3'] = { id: '3', value: newChildValue };
//           state.treeRelations['1'].push('3');
//         });
//         await defer();
//       });
//     });
//
//     it('the new child is displayed', () => {
//       const newChild = getByText(document.body, newChildValue);
//       expect(newChild).toBeInstanceOf(HTMLElement);
//     });
//
//     it('the new child is displayed after the first', () => {
//       const newChild = getByText(document.body, newChildValue);
//       const firstChild = getByText(document.body, firstChildValue);
//       expect(firstChild.parentNode!.parentNode!.nextSibling).toBe(newChild.parentNode!.parentNode);
//     });
//
//     it('no extra children are added', () => {
//       const ul = document.querySelector('ul');
//       expect(ul!.childNodes).toHaveLength(2);
//     });
//   });
//
//   describe('when a child is added in the middle of the list', () => {
//     const firstChildValue = '456';
//     const newChildValue = 'new value';
//     const state = {
//       treeRelations: { '1': ['2'] },
//       trees: {
//         '1': {
//           id: '1',
//           value: '123',
//         },
//         '2': {
//           id: '2',
//           value: firstChildValue,
//         },
//       },
//     };
//
//     beforeEach(async () => {
//       const { store } = renderApp(state);
//       await defer(async () => {
//         store.change((state) => {
//           state.trees['3'] = { id: '3', value: newChildValue };
//           state.treeRelations['1'] = ['3', '2'];
//         });
//         await defer();
//       });
//     });
//
//     it('the new child is displayed in the correct location', () => {
//       const newChild = getByText(document.body, newChildValue);
//       expect(newChild).toBe(document.querySelector('ul > li:first-child > div > strong'));
//     });
//
//     it('the other children remain unchanged', () => {
//       const ul = document.querySelector('ul');
//       expect(ul!.childNodes).toHaveLength(2);
//     });
//   });
//
//   describe('when a child is removed', () => {
//     const firstChildValue = '456';
//     const secondChildValue = '789';
//     const state = {
//       treeRelations: { '1': ['2', '3'] },
//       trees: {
//         '1': {
//           id: '1',
//           value: '123',
//         },
//         '2': {
//           id: '2',
//           value: firstChildValue,
//         },
//         '3': {
//           id: '3',
//           value: secondChildValue,
//         },
//       },
//     };
//
//     beforeEach(async () => {
//       const { store } = renderApp(state);
//       await defer(async () => {
//         store.change((state) => {
//           state.treeRelations['1'] = ['3'];
//         });
//         await defer();
//       });
//     });
//
//     it('the removed child is removed', () => {
//       expect(queryByText(document.body, firstChildValue)).toBe(null);
//     });
//
//     it('the other children are still there', () => {
//       expect(getByText(document.body, secondChildValue)).toBeInstanceOf(HTMLElement);
//     });
//   });
//
//   describe('when a tree with children is removed', () => {
//     const childValue = 'child';
//     const grandChild1 = 'grandChild1';
//     const grandChild2 = 'grandChild2';
//     const state = {
//       treeRelations: { '1': ['2'], '2': ['3', '4'] },
//       trees: {
//         '1': { id: '1', value: '123' },
//         '2': { id: '2', value: childValue },
//         '3': { id: '3', value: grandChild1 },
//         '4': { id: '4', value: grandChild2 },
//       },
//     };
//
//     beforeEach(async () => {
//       const { store } = renderApp(state);
//       await defer(async () => {
//         store.change((state) => {
//           delete state.treeRelations['1'];
//         });
//         await defer();
//       });
//     });
//
//     it('all of the old children are removed', () => {
//       expect(queryByText(document.body, childValue)).toBeNull();
//       expect(queryByText(document.body, grandChild1)).toBeNull();
//       expect(queryByText(document.body, grandChild2)).toBeNull();
//     });
//   });
// });
