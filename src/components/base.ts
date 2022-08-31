import { generateElName } from '../index.js';

export abstract class BaseComponent extends HTMLElement {
  abstract get name(): string;

  abstract render(): void;

  abstract disconnectedCallback(): void;

  getName(value: string) {
    return generateElName(value);
  }

  constructor() {
    super();
    this.render();
  }
}
