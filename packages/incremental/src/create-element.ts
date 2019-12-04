import { ComputedValue, Reference } from './free';
import { assertNever, anyReferencesOverlap } from './utils';

export interface Dictionary<T> {
  [k: string]: T;
}

export interface INode<S> {
  key?: string;
  dependencies: Reference<S>[];
  write(invalidated: Reference<S>[] | null): HTMLElement;
}

export interface InternalProps {
  key?: string;
}

export type FunctionComponent<P extends Dictionary<any> = any> = (props: P & InternalProps) => INode<any>;

export type StaticAttribute = string | number | boolean | null | undefined | Function;
export type StaticChild = string | number | boolean | null | undefined;
export type SingleChild = StaticChild | ComputedValue<any> | INode<any>;
export type ArrayChild = (INode<any> | StaticChild)[];
export type Child = SingleChild | ArrayChild;

export type PreviousChild = HTMLElement | HTMLElement[] | Text | null;
export type PreviousChildren = PreviousChild[];

export type InsertionPointKind = 'child' | 'sibling';
export interface InsertionPoint {
  kind: InsertionPointKind;
  node: Node;
}

function isComputedValue(object: unknown): object is ComputedValue<any> {
  return typeof object === 'object'
    && object !== null
    && 'references' in object
    && 'value' in object;
}

function isNode(object: unknown): object is INode<any> {
  return typeof object === 'object' && object !== null && 'write' in object;
}

function isStaticChild(object: unknown): object is StaticChild {
  let type = typeof object;
  return type === 'string'
    || type === 'number'
    || type === 'boolean'
    || object == null;
}

function isHTMLElement(object: any): object is HTMLElement {
  return object && object.tagName && object.click;
}

function setAttribute(element: HTMLElement, property: string, value: StaticAttribute) {
  (element as any)[property] = value;
}

function writeInvalidAttributes<S, P>(
  element: HTMLElement,
  props: { [k in keyof P]: ComputedValue<S> | StaticAttribute } | null | undefined,
  invalidated: Reference<S>[] | null,
) {
  if (props) {
    for (const key in props) {
      if (Object.prototype.hasOwnProperty.call(props, key)) {
        const propValue: StaticAttribute | ComputedValue<S> = props[key];
        if (!isComputedValue(propValue)) {
          if (!invalidated) {
            setAttribute(element, key, propValue);
          }
        } else {
          if (
            !invalidated
            || anyReferencesOverlap(invalidated, propValue.references)
          ) {
            setAttribute(element, key, propValue.value());
          }
        }
      }
    }
  }
}

function getInsertionPoint(child: PreviousChild): InsertionPoint | undefined {
  if (Array.isArray(child)) {
    return child.length > 0 ? getInsertionPoint(child[child.length - 1]) : undefined;
  }

  if (child) {
    return { kind: 'sibling', node: child };
  }

  return undefined;
}

function insertAtPoint(node: Node, insertionPoint: InsertionPoint): void {
  let kind = insertionPoint.kind;
  switch (kind) {
    case 'child':
      insertionPoint.node.appendChild(node);
      break;

    case 'sibling':
      if (insertionPoint.node.nextSibling) {
        insertionPoint.node.nextSibling.before(node);
      } else if (insertionPoint.node.parentNode) {
        insertionPoint.node.parentNode.appendChild(node);
      }
      break;

    default:
      assertNever(kind);
  }
}

function insertNode(
  node: Node | null,
  previousChild: PreviousChild | undefined,
  insertionPoint: InsertionPoint,
): void {
  if (Array.isArray(previousChild)) {
    // Remove all previous children
    previousChild.forEach((child) => {
      if (child) {
        child.remove();
      }
    });

    if (node) {
      insertAtPoint(node, insertionPoint);
    }
  } else if (node) {
    if (previousChild) {
      previousChild.replaceWith(node);
    } else {
      insertAtPoint(node, insertionPoint);
    }
  } else if (previousChild) {
    // If the node is falsey, the we should just remove the previous child
    previousChild.remove();
  }
}

function writeComputedChild(
  insertionPoint: InsertionPoint,
  child: ComputedValue<any>,
  previousChildren: PreviousChild | undefined,
  invalidated: Reference<any>[] | null,
): PreviousChild {
  if (!invalidated || anyReferencesOverlap(child.references, invalidated)) {
    const value: Child = child.value();
    return writeChild(insertionPoint, value, previousChildren, null);
  }
  return previousChildren || null;
}

function produceNodeChild(
  node: INode<any>,
  previousChild: PreviousChild | undefined,
  invalidated: Reference<any>[] | null,
): HTMLElement {
  return node.write(invalidated);
}

function produceTextChild(
  child: StaticChild,
  previousChild: PreviousChild | undefined,
  invalidated: Reference<any>[] | null,
): HTMLElement | Text | null {
  if (previousChild !== undefined && !Array.isArray(previousChild) && invalidated) {
    return previousChild;
  }

  if (child == null || child === false) {
    return null;
  }

  return document.createTextNode(child.toString());
}

function produceSingleChild(
  child: StaticChild | INode<any>,
  previousChild: PreviousChild | undefined,
  invalidated: Reference<any>[] | null,
): HTMLElement | Text | null {
  return isNode(child)
    ? produceNodeChild(child, previousChild, invalidated)
    : produceTextChild(child, previousChild, invalidated);
}

function writeSingleChild(
  insertionPoint: InsertionPoint,
  child: StaticChild | INode<any>,
  previousChild: PreviousChild | undefined,
  invalidated: Reference<any>[] | null,
): PreviousChild {
  const newChild = produceSingleChild(child, previousChild, invalidated);
  if (newChild !== previousChild) {
    insertNode(newChild, previousChild, insertionPoint);
  }
  return newChild;
}

function keySingleIndex<T extends { key: string }>(list: T[]): { [k: string]: number } {
  const result: { [k: string]: number } = {};
  list.forEach((element, index) => {
    result[element.key] = index;
  });
  return result;
}

function writeArrayChild(
  insertionPoint: InsertionPoint,
  children: ArrayChild,
  previousChildren: PreviousChild | undefined,
  invalidated: Reference<any>[] | null,
): HTMLElement[] {
  const previousChildrenArray = Array.isArray(previousChildren) ? previousChildren : [];
  const previousChildrenMap = keySingleIndex(previousChildrenArray as any) as any;
  const newChildren: any[] = [];

  let childIndex = 0;
  children.forEach((child, index) => {
    if (isStaticChild(child)) {
      // const previousChild = previousChildrenArray[index];
      // const newChild = produceSingleChild(child, previousChild, invalidated);

    } else {
      if (!child.key) {
        throw new Error('Cannot render nodes without a key');
      }

      const previousIndex: number | undefined = previousChildrenMap[child.key];
      const previousChild: HTMLElement | undefined = previousIndex ? previousChildrenArray[previousIndex] : undefined;
      const newChild = produceSingleChild(child, previousChild, invalidated);

      if (newChild) {
        // If the previous and current are the same we can reuse them
        if (newChild === previousChild) {
          if (previousIndex !== childIndex) {
            // Move the child to its new index
            insertAtPoint(newChild, insertionPoint);
            childIndex++;
          }
        } else {
          // Move the child to its new index
          insertAtPoint(newChild, insertionPoint);
          childIndex++;
        }
      }

      // Previous child existed and before sibling is now different
      if (previousChild && newChild !== previousChild) {
        // Remove the previous child
        previousChild.remove();
      }

      insertionPoint = getInsertionPoint(newChild) || insertionPoint;
      newChildren.push(newChild);
    }
  });
  return newChildren || null;
}

function writeChild(
  insertionPoint: InsertionPoint,
  child: Child,
  previousChildren: PreviousChild | undefined,
  invalidated: Reference<any>[] | null,
): PreviousChild {
  if (isComputedValue(child)) {
    return writeComputedChild(insertionPoint, child, previousChildren, invalidated);
  }

  if (Array.isArray(child)) {
    return writeArrayChild(insertionPoint, child, previousChildren, invalidated);
  }

  return writeSingleChild(insertionPoint, child, previousChildren, invalidated);
}

function writeChildren(
  element: HTMLElement,
  children: Child[],
  previousChildren: PreviousChildren,
  invalidated: Reference<any>[] | null,
): PreviousChildren {
  let insertionPoint: InsertionPoint = { kind: 'child', node: element };
  return children.map((child, index) => {
    const newChild = writeChild(insertionPoint, child, previousChildren[index], invalidated);
    insertionPoint = getInsertionPoint(newChild) || insertionPoint;
    return newChild;
  });
}

export function createElement<S, P>(
  tag: string | FunctionComponent<P>,
  props?: { [k in keyof P]: ComputedValue<S> | StaticAttribute } | null,
  ...children: Child[]
): INode<S> {
  if (typeof tag === 'string') {
    let previousElement: HTMLElement | undefined;
    let previousChildren: PreviousChildren = [];
    const key = props && (props as any).key ? (props as any).key : undefined;
    return {
      key,
      dependencies: [],
      write(invalidated: Reference<S>[] | null) {
        // Create this element
        // TODO let element be a computed value
        const element = previousElement || document.createElement(tag);

        // Update attributes
        // TODO this won't reset the attributes when the element is recreated
        writeInvalidAttributes(element, props, invalidated);

        // Update children
        previousChildren = writeChildren(element, children, previousChildren, invalidated);
        previousElement = element;

        return element;
      },
    };
  }

  return tag(props as any);
}
