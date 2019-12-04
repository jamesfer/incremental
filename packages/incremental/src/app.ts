import { Reference } from './free';
import { ElementNode, renderRootNode } from './renderer';

interface RenderFunction {
  (dirtyReferences: Reference<any>[] | null): void;
}

export class App {
  private dirtyReferences: Reference<any>[] = [];
  private scheduledAnimationFrameId: number | undefined = undefined;
  private readonly renderer: RenderFunction;

  constructor(element: HTMLElement | null | undefined, node: ElementNode) {
    if (!element) {
      throw new Error('Element is null or undefined');
    }

    if (element.childElementCount > 0) {
      throw new Error('Element is not empty');
    }

    this.renderer = this.createRenderFunction(element, node);
  }

  invalidate(reference: Reference<any>): void {
    this.dirtyReferences.push(reference);
    this.scheduleNextRender();
  }

  start(): void {
    this.render(true);
    this.scheduleNextRender();
  }

  private createRenderFunction(element: HTMLElement, node: ElementNode): RenderFunction {
    let nodeElement: any;
    return (dirtyReferences) => {
      nodeElement = renderRootNode(element, node, dirtyReferences || [], nodeElement);
    };
  }

  private render(first: boolean = false): void {
    // Perform render
    const dirtyReferences = [...this.dirtyReferences];
    this.renderer(first ? null : dirtyReferences);

    if (dirtyReferences.length !== this.dirtyReferences.length) {
      console.error('Reference was invalidated during render');
    }

    // Clean up
    this.dirtyReferences = [];
  }

  private scheduleNextRender() {
    if (this.scheduledAnimationFrameId === undefined) {
      this.scheduledAnimationFrameId = requestAnimationFrame(() => {
        // Remove the raf id
        this.scheduledAnimationFrameId = undefined;

        this.render();
      });
    }
  }
}


