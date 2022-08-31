import { BaseComponent } from './base.js';

export class Annotation extends BaseComponent {
  get name() {
    return this.getName('view');
  }

  render() {
    // ..
  }

  disconnectedCallback() {
    // ..
  }
}
