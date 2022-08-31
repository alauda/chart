import { BaseComponent } from './base.js';

export class Title extends BaseComponent {
  get name() {
    return this.getName('title');
  }

  render() {
    const shadowRoot = this.attachShadow({ mode: 'closed' });
    shadowRoot.innerHTML = `
    <h1>title</h1>
    `;
  }

  disconnectedCallback() {
    // ..
  }
}
