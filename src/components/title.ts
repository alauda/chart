import { get } from 'lodash';

import { TitleOption } from '../types/index.js';
import { template } from '../utils/index.js';

import { BaseComponent } from './base.js';
import { Header } from './header.js';

export class Title extends BaseComponent<TitleOption> {
  get name(): string {
    return 'title';
  }

  headerContainer: HTMLElement;

  render() {
    const opt = this.ctrl.getOption();
    this.option = get(opt, this.name);
    this.createTitle();
  }

  createTitle() {
    if (typeof this.option === 'object') {
      const { text, formatter } = this.option;
      this.container = document.createElement('div');
      this.container.style.flex = '1';
      // title.className = 'ac-title';
      const value =
        typeof formatter === 'function'
          ? formatter(text)
          : template(formatter, { text });
      this.container.innerHTML = value || text;
      const header = new Header(this.ctrl);
      header.container.append(this.container);
    }
  }

  update() {
    if (this.container) {
      this.container.innerHTML = this.getTitleValue();
    }
  }

  /**
   * 获取标题数据
   */
  private getTitleValue(): string {
    if (typeof this.option === 'object') {
      const { text, formatter } = this.option;
      return typeof formatter === 'function'
        ? formatter(text)
        : template(formatter, { text });
    }
    return '';
  }
}
