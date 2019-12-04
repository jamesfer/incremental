import { Dictionary, InternalProps } from './create-element';
import { ComputedValue, Reference } from './free';
import { anyReferencesOverlap, assertNever } from './utils';

export type FunctionComponent<P extends Dictionary<any> = any> = (props: P & InternalProps) => ReturnType<typeof createElement>;

const elementNodeKind = 'elementNode';
// These can be children args to createElement
export interface ElementNode {
  // write(): HTMLElement;
  kind: any;
  tag: string | FunctionComponent<any>;
  props?: { [k: string]: Attribute } | null | undefined;
  children: Child[];
}
export type TextChild = string | number | boolean | null | undefined | object;
export type ComputedChild = ComputedValue<any>;
export type ArrayChild = ElementNode[];
export type Child = TextChild | ComputedChild | ArrayChild | ElementNode;

export type StaticAttribute = string | number | boolean | null | undefined;
export type ComputedAttribute = ComputedValue<any>;
export type Attribute = StaticAttribute | ComputedAttribute;

enum CacheState {
  Empty,
  Valid,
  Invalid,
}

interface InsertChild {
  kind: 'child';
  node: Node;
}

interface InsertAfter {
  kind: 'after';
  node: Node;
}

type InsertionPoint = InsertChild | InsertAfter;

function childInsertionPoint(node: Node): InsertionPoint {
  return { kind: 'child', node };
}

function afterInsertionPoint(node: Node): InsertionPoint {
  return { kind: 'after', node };
}

export function createElement(
  tag: string | FunctionComponent<any>,
  props?: { [k: string]: Attribute },
  ...children: Child[]
): ElementNode {
  return { tag, props, children, kind: elementNodeKind };
}

function removeNode(node: Node) {
  if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

function insertNode(insertionPoint: InsertionPoint, node: Node, replacing?: Node) {
  const kind = insertionPoint.kind;
  if (replacing === node) {
    // The new node is the same as the old so we're going to move the old one to the correct place
    switch (kind) {
      case 'child':
        if (replacing.parentNode !== insertionPoint.node) {
          insertionPoint.node.appendChild(replacing);
        }
        break;

      case 'after':
        if (replacing.previousSibling !== insertionPoint.node) {
          // There isn't a way to insert something after a node so we have to do this
          if (insertionPoint.node.nextSibling) {
            insertionPoint.node.nextSibling.before(replacing);
          } else if (insertionPoint.node.parentNode) {
            insertionPoint.node.parentNode.appendChild(replacing);
          }
        }
        break;

      default:
        assertNever(kind);
    }
  } else {
    switch (kind) {
      case 'child':
        insertionPoint.node.appendChild(node);
        break;

      case 'after':
        // There isn't a way to insert something after a node so we have to do this
        if (insertionPoint.node.nextSibling) {
          insertionPoint.node.nextSibling.before(node);
        } else if (insertionPoint.node.parentNode) {
          insertionPoint.node.parentNode.appendChild(node);
        }
        break;

      default:
        assertNever(kind);
    }

    if (replacing && node !== replacing) {
      const parent = replacing.parentNode;
      if (parent) {
        parent.removeChild(replacing);
      }
    }
  }
}

function textChildValue(child: TextChild): string | undefined {
  if (child == null || child === false || child === true || child === '') {
    return undefined;
  }

  return child.toString();
}

function produceTextChild(
  insertionPoint: InsertionPoint,
  child: TextChild,
  invalidated: Reference<any>[],
  previousChild: Text | undefined,
  cacheState: CacheState,
): [InsertionPoint, Text | undefined] {
  if (previousChild) {
    if (cacheState === CacheState.Valid) {
      return [insertionPoint, previousChild];
    }

    if (cacheState === CacheState.Invalid) {
      const value = textChildValue(child);
      if (previousChild instanceof Text) {
        if (typeof value === 'string') {
          if (previousChild.textContent !== value) {
            previousChild.textContent = value;
          }
          insertNode(insertionPoint, previousChild);
          return [afterInsertionPoint(previousChild), previousChild];
        } else {
          removeNode(previousChild);
        }
      }
    }
  }

  const value = textChildValue(child);
  if (typeof value === 'string') {
    const node = document.createTextNode(value);
    insertNode(insertionPoint, node);
    return [afterInsertionPoint(node), node];
  }
  return [insertionPoint, undefined];
}

function renderComputedChild(
  insertionPoint: InsertionPoint,
  child: ComputedChild,
  invalidated: Reference<any>[],
  state: { previousChildren: Child, previousElement: any } | undefined,
  cacheState: CacheState,
): [InsertionPoint, { previousChildren: Child, previousElement: any }] {
  const { previousChildren, previousElement } = state || {};
  if (cacheState === CacheState.Empty || anyReferencesOverlap(child.references, invalidated)) {
    const value: Child = child.value();
    const [nextInsertionPoint, element] = render(insertionPoint, value, invalidated, previousElement, cacheState === CacheState.Empty ? CacheState.Empty : CacheState.Invalid);
    return [nextInsertionPoint, {
      previousChildren: value,
      previousElement: element,
    }];
  }

  // Even when the computed value hasn't changed, we still need to walk the old children to check
  // if they changed
  const [newInsertionPoint, element] = render(insertionPoint, previousChildren, invalidated, previousElement, cacheState);
  return [newInsertionPoint, {
    previousChildren,
    previousElement: element,
  }];
}

function isElementNode(object: unknown): object is ElementNode {
  return typeof object === 'object'
    && object !== null
    && (object as any).kind === elementNodeKind;
}

function isComputedValue(object: unknown): object is ComputedValue<any> {
  return typeof object === 'object'
    && object !== null
    && 'references' in object
    && 'value' in object;
}

function setAttribute(element: HTMLElement, property: string, value: StaticAttribute) {
  (element as any)[property] = value;
}

function writeInvalidAttributes(
  element: HTMLElement,
  props: { [k: string]: Attribute } | null | undefined,
  invalidated: Reference<any>[],
  cacheState: CacheState,
) {
  // TODO this doesn't remove attributes that have disappeared
  if (props) {
    for (const key in props) {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        const propValue = props[key];
        if (!isComputedValue(propValue)) {
          if (cacheState === CacheState.Empty) {
            setAttribute(element, key, propValue);
          } else if (cacheState === CacheState.Invalid) {
            if ((element as any)[key] !== propValue) {
              setAttribute(element, key, propValue);
            }
          }
        } else if (
          cacheState === CacheState.Empty
          || anyReferencesOverlap(invalidated, propValue.references)
        ) {
          setAttribute(element, key, propValue.value());
        }
      }
    }
  }
}

function produceElementTag(
  tag:string,
  invalidated: Reference<any>[],
  previousTag: HTMLElement | undefined,
  cacheState: CacheState,
): HTMLElement {
  // TODO let element be a computed value
  if (previousTag) {
    if (cacheState === CacheState.Valid) {
      return previousTag;
    }

    if (previousTag.nodeName === tag) {
      return previousTag;
    }
  }

  return document.createElement(tag);
}

function renderElementNode(
  insertionPoint: InsertionPoint,
  child: ElementNode,
  invalidated: Reference<any>[],
  state: { previousChildren: any[], previousTag: HTMLElement | undefined } | undefined,
  cacheState: CacheState,
): [InsertionPoint, { previousChildren: any[], previousTag: HTMLElement | undefined }] {
  if (typeof child.tag !== 'string') {
    return renderElementNode(insertionPoint, child.tag(child.props as any), invalidated, state, cacheState);
  }

  const { previousChildren = [], previousTag } = state || {};

  // Create this element
  const tag = produceElementTag(child.tag, invalidated, previousTag, cacheState);

  // Update attributes
  writeInvalidAttributes(tag, child.props, invalidated, cacheState);

  // Update children
  let nextInsertionPoint: InsertionPoint = { kind: 'child', node: tag };
  const results = child.children.map((childNode, index) => {
    const [childInsertionPoint, result] = render(nextInsertionPoint, childNode, invalidated, previousChildren[index], cacheState);
    nextInsertionPoint = childInsertionPoint;
    return result;
  });

  // Insert the new tag if required
  insertNode(insertionPoint, tag, previousTag);
  return [afterInsertionPoint(tag), { previousChildren: results, previousTag: tag }];
}

function renderArrayChild(
  insertionPoint: InsertionPoint,
  children: ArrayChild,
  invalidated: Reference<any>[],
  previousChildren: Dictionary<any> | undefined,
  cacheState: CacheState,
): [InsertionPoint, Dictionary<any>] {
  const newChildren: Dictionary<any> = {};
  let nextInsertionPoint = insertionPoint;

  children.forEach((child) => {
    const key = child.props ? child.props.key : null;
    if (key == null) {
      throw new Error('Cannot render nodes without a key');
    }

    if (isComputedValue(key)) {
      throw new Error('Key cannot be a computed value');
    }

    if (typeof key === 'boolean') {
      throw new Error('Boolean values cannot be used as keys');
    }

    const previousChild = previousChildren ? previousChildren[key] : undefined;
    ([nextInsertionPoint, newChildren[key]] = render(nextInsertionPoint, child, invalidated, previousChild, cacheState));
  });

  return [nextInsertionPoint, newChildren];
}

function render(insertionPoint: InsertionPoint, child: Child, invalidated: Reference<any>[], previousChild: any, cacheState: CacheState): [InsertionPoint, any] {
  if (isComputedValue(child)) {
    return renderComputedChild(insertionPoint, child, invalidated, previousChild, cacheState);
  }

  if (Array.isArray(child)) {
    return renderArrayChild(insertionPoint, child, invalidated, previousChild, cacheState);
  }

  if (isElementNode(child)) {
    return renderElementNode(insertionPoint, child, invalidated, previousChild, cacheState);
  }

  return produceTextChild(insertionPoint, child, invalidated, previousChild, cacheState);
}

export function renderRootNode(container: HTMLElement, child: ElementNode, invalidated: Reference<any>[], previousChild?: any): any {
  const [, element] = renderElementNode(
    childInsertionPoint(container),
    child,
    invalidated,
    previousChild,
    previousChild ? CacheState.Valid : CacheState.Empty,
  );
  return element;
}
