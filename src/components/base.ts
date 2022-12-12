import { View } from '../chart/view.js';

export type ComponentCtor<O = any> = new (view: View) => BaseComponent<O>;

export abstract class BaseComponent<O = unknown> {
  protected option: O;

  abstract get name(): string;

  abstract render(): void;

  constructor() {
    this.render();
  }
}
