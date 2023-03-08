import { StyleSheet, css } from 'aphrodite/no-important.js';
import { get } from 'lodash';

import { TitleOption } from '../types/index.js';
import { generateName, template } from '../utils/index.js';

import { BaseComponent } from './base.js';
import { Header } from './header.js';

const styles = StyleSheet.create({
  title: {
    wordBreak: 'break-all',
  },
});

export class Title extends BaseComponent<TitleOption> {
  get name(): string {
    return 'title';
  }

  headerContainer: HTMLElement;

  render() {
    const opt = this.ctrl.getOption();
    this.option = get(opt, this.name);
    if (!this.headerContainer) {
      this.createTitle();
    } else {
      this.update();
    }
  }

  createTitle() {
    if (typeof this.option === 'object') {
      this.container = document.createElement('div');
      this.container.style.wordBreak = 'break-all'
      this.container.style.flex = '1';
      this.container.className = `${generateName('title')} ${css(
        styles.title,
      )}`;
      this.update()
      const header = new Header(this.ctrl);
      header.container.append(this.container);
      this.headerContainer = header.container;
    }
  }

  update() {
    this.option = get(this.ctrl.getOption(), this.name);
    if (this.container && !get(this.option, 'custom')) {
      this.container.innerHTML = this.getTitleValue();
    }
  }

  /**
   * 获取标题数据
   */
  private getTitleValue(): string {
    if (typeof this.option === 'object') {
      const { text, formatter } = this.option;
      return (
        (typeof formatter === 'function'
          ? formatter(text)
          : template(formatter, { text })) || text
      );
    }
    return '';
  }
}
