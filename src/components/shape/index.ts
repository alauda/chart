import { BaseComponent } from '../base.js';

export class Shape extends BaseComponent {
  get name() {
    return this.getName('shape');
  }

  render() {
    // ..
  }

  disconnectedCallback() {
    // ..
  }
}
