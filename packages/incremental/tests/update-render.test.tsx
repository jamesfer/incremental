import { App, ComputedValue, createElement, FunctionComponent } from '../src';
import { computed, defer, node, summariseChildren } from './utils';

describe('incremental: update render', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('updates a simple computed value', async () => {
    let a = 'Hello';
    const value = computed(['a'], () => a);
    const app = new App(element, <div>{value}</div>);
    app.start();

    expect(summariseChildren(element)).toEqual([node('div', 'Hello')]);

    a = 'World';
    app.invalidate({ path: ['a'] });
    await defer();
    expect(summariseChildren(element)).toEqual([node('div', 'World')]);
  });

  it('updates a computed value that contains other nodes', async () => {
    let a = 'Hello';
    const value = computed(['a'], () => <p>{a}</p>);
    const app = new App(element, <div>{value}</div>);
    app.start();

    expect(summariseChildren(element)).toEqual([node('div', node('p', 'Hello'))]);

    a = 'World';
    app.invalidate({ path: ['a'] });
    await defer();
    expect(summariseChildren(element)).toEqual([node('div', node('p', 'World'))]);
  });

  it('updates a computed value that contains changing nodes', async () => {
    let a = <p>Hello</p>;
    const value = computed(['a'], () => a);
    const app = new App(element, <div>{value}</div>);
    app.start();

    expect(summariseChildren(element)).toEqual([node('div', node('p', 'Hello'))]);

    a = <h1>World</h1>;
    app.invalidate({ path: ['a'] });
    await defer();
    expect(summariseChildren(element)).toEqual([node('div', node('h1', 'World'))]);
  });

  it('updates a computed value that contains changing child types', async () => {
    let a = <p>Hello</p>;
    const value = computed(['a'], () => a);
    const app = new App(element, <div>{value}</div>);
    app.start();

    expect(summariseChildren(element)).toEqual([node('div', node('p', 'Hello'))]);

    a = 'World';
    app.invalidate({ path: ['a'] });
    await defer();
    expect(summariseChildren(element)).toEqual([node('div', 'World')]);
  });

  it('updates children of a dynamic expression that was not invalidated', async () => {
    let a = 1;
    const computedA = computed(['a'], () => a);
    const Child: FunctionComponent = () => <div>{computedA}</div>;
    const computedB = computed(['b'], () => <Child/>);
    const app = new App(element, <div>{computedB}</div>);
    app.start();

    expect(summariseChildren(element)).toEqual([
      node('div', node('div', '1')),
    ]);

    a = 2;
    app.invalidate({ path: ['a'] });
    await defer();
    expect(summariseChildren(element)).toEqual([
      node('div', node('div', '2')),
    ]);
  });
});
