import { App, ComputedValue, createElement, FunctionComponent } from '../src';
import { node, summariseChildren } from './utils';

describe('incremental: update render', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('updates children of a dynamic expression that was not invalidated', async () => {
    let a = 1;
    const computedA: ComputedValue<any> = {
      references: [{ path: ['a'] }],
      value: () => a,
    };
    const Child: FunctionComponent = () => <div>{computedA}</div>;
    const computedB: ComputedValue<any> = {
      references: [{ path: ['b'] }],
      value: () => <Child/>
    };
    const app = new App(element, <div>{computedB}</div>);
    app.start();

    expect(summariseChildren(element)).toEqual([
      node('div', node('div', '1')),
    ]);

    a = 2;
    app.invalidate({ path: ['a'] });
    await new Promise(res => setTimeout(res, 0));
    expect(summariseChildren(element)).toEqual([
      node('div', node('div', '2')),
    ]);
  });
});
