import { App, ElementNode } from '../src';

export function render(node: ElementNode): App {
  const app = new App(document.body, node);
  app.start();
  return app;
}

export interface SummarisedNode {
  tag: string;
  children: (SummarisedNode | string)[];
}

export type SummarisedChild = SummarisedNode | string;

export function summarise(element: ChildNode): SummarisedChild {
  if (element.nodeName === '#text') {
    return element.textContent || '';
  }

  return {
    tag: element.nodeName.toLowerCase(),
    children: Array.from(element.childNodes).map(summarise),
  };
}

export function summariseChildren(element: ChildNode): SummarisedChild[] {
  return Array.from(element.childNodes).map(summarise);
}

export function node(tag: string, children: SummarisedChild | SummarisedChild[]): SummarisedChild {
  return { tag, children: Array.isArray(children) ? children : [children] };
}
