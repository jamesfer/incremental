import { ComputedValue, Reference } from './free';
import { anyReferencesOverlap, assertNever, assertType, Dictionary } from './utils';

export interface InternalProps {
  key?: string;
}

export type FunctionComponent<P extends Dictionary<any> = any> = (props: P & InternalProps) => ReturnType<typeof createElement>;

const elementNodeKind = 'elementNode';
// These can be children args to createElement
export interface ElementNode {
  kind: any;
  tag: string | FunctionComponent<any>;
  props?: { [k: string]: Attribute } | null | undefined;
  children: Child[];
}
export type TextChild = string | number | boolean | null | undefined | object;
export type ComputedChild = ComputedValue<any>;
export type ArrayChild = ElementNode[];
export type Child = TextChild | ComputedChild | ArrayChild | ElementNode;

export interface ElementNodeState {
  previousChildren: NodeState[];
  previousTag: HTMLElement | undefined;
}
export interface ComputedNodeState {
  previousChildren: Child;
  previousState: NodeState;
}
export interface ArrayNodeState {
  keyedChildren: Dictionary<NodeState>
}
export type TextNodeState = Text | undefined;
export type NodeState = TextNodeState | ComputedNodeState | ArrayNodeState | ElementNodeState;

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

function moveNode(insertionPoint: InsertionPoint, replacing: Node) {
  switch (insertionPoint.kind) {
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
      assertNever(insertionPoint);
  }
}

function insertNode(insertionPoint: InsertionPoint, node: Node) {
  switch (insertionPoint.kind) {
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
      assertNever(insertionPoint);
  }
}

function removePreviousState(state: NodeState) {
  if (!state) {
    return;
  }

  if (isTextNodeState(state)) {
    state.remove();
  } else if (isElementNodeState(state)) {
    if (state.previousTag) {
      state.previousTag.remove();
    }
  } else if (isComputedNodeState(state)) {
    removePreviousState(state.previousState);
  } else {
    Object.values(state.keyedChildren).forEach(removePreviousState);
  }
}

function isComputedNodeState(state: Exclude<NodeState, undefined>): state is ComputedNodeState {
  if ('previousState' in state) {
    // Confirm that the state is correctly narrowed
    assertType<ComputedNodeState>(state);
    return true;
  }
  return false;
}

function isElementNodeState(state: Exclude<NodeState, undefined>): state is ElementNodeState {
  if ('previousTag' in state) {
    // Confirm that the state is correctly narrowed
    assertType<ElementNodeState>(state);
    return true;
  }
  return false;
}

function isArrayNodeState(state: Exclude<NodeState, undefined>): state is ArrayNodeState {
  if ('keyedChildren' in state) {
    // Confirm that the state is correctly narrowed
    assertType<ArrayNodeState>(state);
    return true;
  }
  return false;
}

function isTextNodeState(state: Exclude<NodeState, undefined>): state is Exclude<TextNodeState, undefined> {
  if ('nodeName' in state) {
    // Confirm that the state is correctly narrowed
    assertType<TextNodeState>(state);
    return true;
  }
  return false;
}

function textChildValue(child: TextChild): string | undefined {
  if (child == null || child === false || child === true || child === '') {
    return undefined;
  }

  return child.toString();
}

function renderTextChild(
  insertionPoint: InsertionPoint,
  child: TextChild,
  invalidated: Reference<any>[],
  previousState: NodeState | undefined,
  cacheState: CacheState,
): [InsertionPoint, TextNodeState | undefined] {
  if (previousState && isTextNodeState(previousState)) {
    if (cacheState === CacheState.Valid) {
      return [insertionPoint, previousState];
    }

    if (cacheState === CacheState.Invalid && previousState instanceof Text) {
      const value = textChildValue(child);
      if (typeof value === 'string') {
        if (previousState.textContent !== value) {
          previousState.textContent = value;
        }
        insertNode(insertionPoint, previousState);
        return [afterInsertionPoint(previousState), previousState];
      } else {
        removeNode(previousState);
      }
    }
  }

  const value = textChildValue(child);
  if (typeof value === 'string') {
    const node = document.createTextNode(value);
    insertNode(insertionPoint, node);
    if (previousState) {
      removePreviousState(previousState);
    }
    return [afterInsertionPoint(node), node];
  }
  return [insertionPoint, undefined];
}

function renderComputedChild(
  insertionPoint: InsertionPoint,
  child: ComputedChild,
  invalidated: Reference<any>[],
  state: NodeState | undefined,
  cacheState: CacheState,
): [InsertionPoint, ComputedNodeState] {
  let previousChildren: Child = {};
  let previousState: NodeState | undefined = undefined;
  if (state && isComputedNodeState(state)) {
    ({ previousChildren, previousState } = state);
  }

  if (cacheState === CacheState.Empty || anyReferencesOverlap(child.references, invalidated)) {
    const value: Child = child.value();
    const [nextInsertionPoint, state] = render(insertionPoint, value, invalidated, previousState, cacheState === CacheState.Empty ? CacheState.Empty : CacheState.Invalid);
    return [nextInsertionPoint, {
      previousChildren: value,
      previousState: state,
    }];
  }

  // Even when the computed value hasn't changed, we still need to walk the old children to check
  // if they changed
  const [newInsertionPoint, element] = render(insertionPoint, previousChildren, invalidated, previousState, cacheState);
  return [newInsertionPoint, {
    previousChildren,
    previousState: element,
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
  previousState: NodeState | undefined,
  cacheState: CacheState,
): [InsertionPoint, ElementNodeState] {
  if (typeof child.tag !== 'string') {
    return renderElementNode(insertionPoint, child.tag(child.props as any), invalidated, previousState, cacheState);
  }

  let previousChildren: NodeState[] = [];
  let previousTag: HTMLElement | undefined = undefined;
  if (previousState && isElementNodeState(previousState)) {
    ({ previousChildren, previousTag } = previousState);
  }

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
  if (previousTag === tag) {
    moveNode(insertionPoint, tag);
  } else {
    insertNode(insertionPoint, tag);
    if (previousTag) {
      removeNode(previousTag);
    }
  }
  return [afterInsertionPoint(tag), { previousChildren: results, previousTag: tag }];
}

function renderArrayChild(
  insertionPoint: InsertionPoint,
  children: ArrayChild,
  invalidated: Reference<any>[],
  previousState: NodeState | undefined,
  cacheState: CacheState,
): [InsertionPoint, ArrayNodeState] {
  const newChildren: Dictionary<NodeState> = {};
  let nextInsertionPoint = insertionPoint;

  let previousChildren: Dictionary<NodeState> = {};
  if (previousState && isArrayNodeState(previousState)) {
    previousChildren = previousState.keyedChildren;
  }

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

    const previousChild = previousChildren[key];
    ([nextInsertionPoint, newChildren[key]] = render(nextInsertionPoint, child, invalidated, previousChild, cacheState));
  });

  return [nextInsertionPoint, { keyedChildren: newChildren }];
}

function render(insertionPoint: InsertionPoint, child: Child, invalidated: Reference<any>[], previousState: NodeState, cacheState: CacheState): [InsertionPoint, NodeState] {
  if (isComputedValue(child)) {
    return renderComputedChild(insertionPoint, child, invalidated, previousState, cacheState);
  }

  if (Array.isArray(child)) {
    return renderArrayChild(insertionPoint, child, invalidated, previousState, cacheState);
  }

  if (isElementNode(child)) {
    return renderElementNode(insertionPoint, child, invalidated, previousState, cacheState);
  }

  return renderTextChild(insertionPoint, child, invalidated, previousState, cacheState);
}

export function renderRootNode(container: HTMLElement, child: ElementNode, invalidated: Reference<any>[], previousChild?: ElementNodeState | undefined): ElementNodeState {
  const [, element] = renderElementNode(
    childInsertionPoint(container),
    child,
    invalidated,
    previousChild,
    previousChild ? CacheState.Valid : CacheState.Empty,
  );
  return element;
}
