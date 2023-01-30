import { StyleSheet, css } from 'aphrodite/no-important.js';
import { get, isBoolean } from 'lodash';

import { ChartEvent, DIRECTION, LegendOption } from '../types/index.js';
import { generateName } from '../utils/index.js';

import { BaseComponent } from './base.js';
import { Header } from './header.js';
import { symbolStyle } from './styles.js';

type PositionTop = 'top' | 'top-left' | 'top-right';
type PositionBottom = 'bottom' | 'bottom-left' | 'bottom-right';

const styles = StyleSheet.create({
  ul: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
  },
  item: {
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    ':not(:last-child)': {
      marginRight: 12,
    },
  },
  legend: {
    display: 'flex',
    marginTop: 8,
  },
  bottom: {
    justifyContent: 'center',
  },
  'bottom-left': {
    justifyContent: 'flex-start',
  },
  'bottom-right': {
    justifyContent: 'flex-end',
  },
});

export class Legend extends BaseComponent<LegendOption> {
  get name(): string {
    return 'legend';
  }

  render() {
    const opt = this.ctrl.getOption();
    this.option = get(opt, this.name, {});
    this.create();
  }

  update() {
    this.createItem();
  }

  create() {
    if (!isBoolean(this.option)) {
      const { position } = this.option;
      let dom: HTMLElement = this.ctrl.container;
      this.container = document.createElement('div');
      this.container.className = generateName('legend');
      if (position?.includes('top') || !position) {
        const header = new Header(
          this.ctrl,
          position?.includes('top')
            ? (position as PositionTop)
            : DIRECTION.TOP_RIGHT,
        );
        dom = header.container;
        dom.append(this.container);
        this.createItem();
      } else {
        this.ctrl.on(ChartEvent.U_PLOT_READY, () => {
          dom.append(this.container);
          this.container.className = `${generateName('legend')} ${css(
            styles.legend,
          )} ${css(styles[position as PositionBottom])}`;
          this.createItem();
        });
      }
    }
  }

  createItem() {
    if (!isBoolean(this.option)) {
      this.container.innerHTML = '';
      const ul = document.createElement('ul');
      ul.className = css(styles.ul);
      const data = this.getLegend();

      for (const [index, key] of data.entries()) {
        const li = document.createElement('li');
        const value = key;
        li.className = css(styles.item);
        li.innerHTML = `
        <span class="${css(symbolStyle.symbol)} ${css(
          symbolStyle.line,
        )}" style="background: ${value.color};"></span> 
        <span>${value.name}</span>`;
        ul.append(li);
        li.addEventListener('click', () => {
          const isActive = li.style.opacity === '1' || !li.style.opacity;
          li.style.opacity = isActive ? '0.5' : '1';
          this.ctrl.emit(ChartEvent.LEGEND_ITEM_CLICK, {
            index: Number(index),
            data: value,
            isActive,
          });
        });
        // li.addEventListener('mouseenter', e => {
        //   console.log(e);
        //   const item = this.container.querySelectorAll('li');
        //   item.forEach(value => {
        //     if (li !== value) {
        //       value.style.opacity = '0.5';
        //     }
        //   });
        // });

        // li.addEventListener('mouseleave', () => {
        //   const item = this.container.querySelectorAll('li');
        //   item.forEach(value => {
        //     value.style.opacity = '1';
        //   });
        // });
      }
      this.container.append(ul);
    }
  }

  getLegend() {
    const data = this.ctrl.getData();
    return data.map(({ name, color }) => ({
      name,
      color,
    }));
  }
}
