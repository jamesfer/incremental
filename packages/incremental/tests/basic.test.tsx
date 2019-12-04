import { App, ComputedValue, createElement, FunctionComponent } from '../src';
import { node, summariseChildren } from './utils';

describe('incremental', () => {
  let element: HTMLElement;
  
  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });
  
  afterEach(() => {
    element.remove();
  });

  it('renders an empty element', () => {
    const app = new App(element, <div />);
    app.start();

    expect(element.childNodes).toHaveLength(1);
    expect(element.childNodes[0]).toHaveProperty('nodeName', 'DIV');
    expect(element.childNodes[0].childNodes).toHaveLength(0);
  });

  it('renders an element with text children', () => {
    const app = new App(element, <div>Hello</div>);
    app.start();

    expect(element.childNodes).toHaveLength(1);
    expect(element.childNodes[0]).toHaveProperty('nodeName', 'DIV');
    expect(element.childNodes[0].childNodes).toHaveLength(1);
    expect(element.childNodes[0].childNodes[0]).toHaveProperty('nodeName', '#text');
    expect(element.childNodes[0].childNodes[0]).toHaveProperty('textContent', 'Hello');
    expect(element.childNodes[0].childNodes[0].childNodes).toHaveLength(0);
  });

  it.each([null, false, undefined])('renders nothing when a child is %s', (value) => {
    const app = new App(element, <div>{value}</div>);
    app.start();

    expect(summariseChildren(element)).toEqual([{ tag: 'div', children: [] }]);
  });

  it('renders an element with child nodes', () => {
    const app = new App(element, <div><h1>Hello</h1></div>);
    app.start();

    expect(summariseChildren(element)).toEqual([{
      tag: 'div',
      children: [{
        tag: 'h1',
        children: ['Hello'],
      }],
    }]);
  });
  
  it('renders an element with multiple children', () => {
    const app = new App(element, <div><h1>Hello</h1><p>Paragraph</p></div>);
    app.start();
    
    expect(element.childNodes).toHaveLength(1);
    expect(element.childNodes[0]).toHaveProperty('nodeName', 'DIV');
    expect(element.childNodes[0].childNodes).toHaveLength(2);
    expect(element.childNodes[0].childNodes[0]).toHaveProperty('nodeName', 'H1');
    expect(element.childNodes[0].childNodes[0].childNodes).toHaveLength(1);
    expect(element.childNodes[0].childNodes[0].childNodes[0]).toHaveProperty('nodeName', '#text');
    expect(element.childNodes[0].childNodes[0].childNodes[0]).toHaveProperty('textContent', 'Hello');
    expect(element.childNodes[0].childNodes[1]).toHaveProperty('nodeName', 'P');
    expect(element.childNodes[0].childNodes[1].childNodes).toHaveLength(1);
    expect(element.childNodes[0].childNodes[1].childNodes[0]).toHaveProperty('nodeName', '#text');
    expect(element.childNodes[0].childNodes[1].childNodes[0]).toHaveProperty('textContent', 'Paragraph');
  });

  it.skip('renders an array of strings', () => {
    const app = new App(element, <div>{[1, 2]}</div>);
    app.start();

    expect(summariseChildren(element)).toEqual([{
      tag: 'div',
      children: [
        { tag: 'h1', children: ['1'] },
        { tag: 'h2', children: ['2'] },
      ],
    }]);
  });

  it('renders an array of children', () => {
    const app = new App(element, <div>{[<h1 key="1">1</h1>, <h2 key="2">2</h2>]}</div>);
    app.start();

    expect(summariseChildren(element)).toEqual([{
      tag: 'div',
      children: [
        { tag: 'h1', children: ['1'] },
        { tag: 'h2', children: ['2'] },
      ],
    }]);
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
