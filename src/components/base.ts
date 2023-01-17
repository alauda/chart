import { View } from '../chart/view.js';

export type ComponentCtor<O = any> = new (view: View) => BaseComponent<O>;

export abstract class BaseComponent<O = unknown> {
  protected option: O;

  abstract get name(): string;

  abstract render(): void;

  abstract update(): void;

  container: HTMLElement;

  ctrl: View;

  constructor(ctrl: View) {
    this.ctrl = ctrl;
    // this.render();
  }

  destroy() {
    this.container?.remove();
  }
}
