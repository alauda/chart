import { StyleSheet, css } from 'aphrodite/no-important.js';

import { View } from '../chart/view.js';
import { DIRECTION } from '../types/index.js';
import { generateName, resizeObserver } from '../utils/index.js';

const styles = StyleSheet.create({
  top: {
    alignItems: 'center',
    flexDirection: 'column',
  },
  'top-left': {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  'top-right': {
    flexDirection: 'row',
  },
});

export class Header {
  get name(): string {
    return 'header';
  }

  position: 'top' | 'top-left' | 'top-right';

  ctrl: View;

  container: HTMLElement;

  private sizeObserver: ResizeObserver;

  constructor(
    ctrl: View,
    position: 'top' | 'top-left' | 'top-right' = DIRECTION.TOP_RIGHT,
  ) {
    this.ctrl = ctrl;
    this.position = position;
    this.render();
    this.sizeObserver = resizeObserver(this.container, () => {
      this.ctrl.render();
    });
  }

  render(): void {
    this.create();
  }

  create() {
    const headerName = generateName('header');
    const header: HTMLElement = this.ctrl.chartContainer.querySelector(
      `.${headerName}`,
    );
    if (!this.container) {
      this.container = header || document.createElement('div');
      header.style.wordBreak = 'break-all;';
      this.container.style.display = 'flex';
      if (!header) {
        this.ctrl.chartContainer.append(this.container);
      }
    }
    this.container.className = `${generateName('header')} ${css(
      styles[this.position],
    )}`;
  }

  destroy() {
    this.sizeObserver.disconnect();
  }
}
