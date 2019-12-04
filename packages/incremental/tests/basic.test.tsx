import { App, ComputedValue, createElement, FunctionComponent } from '../src';
import { node, summarise } from './utils';

describe('incremental', () => {
  afterEach(() => {
    document.body.childNodes.forEach(node => node.remove());
  });

  it('renders an empty element', () => {
    const app = new App(document.body, <div />);
    app.start();

    expect(document.body.childNodes).toHaveLength(1);
    expect(document.body.childNodes[0]).toHaveProperty('nodeName', 'DIV');
    expect(document.body.childNodes[0].childNodes).toHaveLength(0);
  });

  it('renders an element with text children', () => {
    const app = new App(document.body, <div>Hello</div>);
    app.start();

    expect(document.body.childNodes).toHaveLength(1);
    expect(document.body.childNodes[0]).toHaveProperty('nodeName', 'DIV');
    expect(document.body.childNodes[0].childNodes).toHaveLength(1);
    expect(document.body.childNodes[0].childNodes[0]).toHaveProperty('nodeName', '#text');
    expect(document.body.childNodes[0].childNodes[0]).toHaveProperty('textContent', 'Hello');
    expect(document.body.childNodes[0].childNodes[0].childNodes).toHaveLength(0);
  });

  it.each([null, false, undefined])('renders nothing when a child is %s', (value) => {
    const app = new App(document.body, <div>{value}</div>);
    app.start();

    expect(summarise(document.body)).toEqual({
      tag: 'body',
      children: [{ tag: 'div', children: [] }]
    });
  });

  it('renders an element with child nodes', () => {
    const app = new App(document.body, <div><h1>Hello</h1></div>);
    app.start();

    expect(summarise(document.body)).toEqual({
      tag: 'body',
      children: [{
        tag: 'div',
        children: [{
          tag: 'h1',
          children: ['Hello'],
        }]
      }],
    });
  });
  
  it('renders an element with multiple children', () => {
    const app = new App(document.body, <div><h1>Hello</h1><p>Paragraph</p></div>);
    app.start();
    
    expect(document.body.childNodes).toHaveLength(1);
    expect(document.body.childNodes[0]).toHaveProperty('nodeName', 'DIV');
    expect(document.body.childNodes[0].childNodes).toHaveLength(2);
    expect(document.body.childNodes[0].childNodes[0]).toHaveProperty('nodeName', 'H1');
    expect(document.body.childNodes[0].childNodes[0].childNodes).toHaveLength(1);
    expect(document.body.childNodes[0].childNodes[0].childNodes[0]).toHaveProperty('nodeName', '#text');
    expect(document.body.childNodes[0].childNodes[0].childNodes[0]).toHaveProperty('textContent', 'Hello');
    expect(document.body.childNodes[0].childNodes[1]).toHaveProperty('nodeName', 'P');
    expect(document.body.childNodes[0].childNodes[1].childNodes).toHaveLength(1);
    expect(document.body.childNodes[0].childNodes[1].childNodes[0]).toHaveProperty('nodeName', '#text');
    expect(document.body.childNodes[0].childNodes[1].childNodes[0]).toHaveProperty('textContent', 'Paragraph');
  });

  it.skip('renders an array of strings', () => {
    const app = new App(document.body, <div>{[1, 2]}</div>);
    app.start();

    expect(summarise(document.body)).toEqual({
      tag: 'body',
      children: [
        {
          tag: 'div',
          children: [
            { tag: 'h1', children: ['1'] },
            { tag: 'h2', children: ['2'] },
          ],
        },
      ],
    });
  });

  it('renders an array of children', () => {
    const app = new App(document.body, <div>{[<h1 key="1">1</h1>, <h2 key="2">2</h2>]}</div>);
    app.start();

    expect(summarise(document.body)).toEqual({
      tag: 'body',
      children: [
        {
          tag: 'div',
          children: [
            { tag: 'h1', children: ['1'] },
            { tag: 'h2', children: ['2'] },
          ],
        },
      ],
    });
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
    const app = new App(document.body, <div>{computedB}</div>);
    app.start();

    expect(summarise(document.body)).toEqual(node('body', [
      node('div', node('div', '1')),
    ]));

    a = 2;
    app.invalidate({ path: ['a'] });
    await new Promise(res => setTimeout(res, 0));
    console.log(document.body.innerHTML);
    expect(summarise(document.body)).toEqual(node('body', [
      node('div', node('div', '2')),
    ]));
  });
});
