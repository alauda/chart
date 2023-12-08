import { StyleSheet, css } from 'aphrodite/no-important.js';
import { get, isBoolean, isObject } from 'lodash';

import { ChartEvent, DIRECTION, LegendOption } from '../types/index.js';
import { generateName } from '../utils/index.js';

import { BaseComponent } from './base.js';
import { Header } from './header.js';
import { symbolStyle } from './styles.js';

type PositionTop = 'top' | 'top-left' | 'top-right';
type PositionBottom = 'bottom' | 'bottom-left' | 'bottom-right';

export interface LegendItem {
  name: string;
  color: string;
  activated: boolean;
}

const styles = StyleSheet.create({
  ul: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexWrap: 'wrap',
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
  name: {
    display: 'block',
    whiteSpace: 'nowrap',
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

  inactivatedSet = new Set<string>();

  render() {
    const opt = this.ctrl.getOption();
    this.option = get(opt, this.name, {});
    if (!this.container) {
      this.create();
    } else {
      this.update();
    }
  }

  update() {
    this.option = get(this.ctrl.getOption(), this.name);
    this.createItem();
  }

  create() {
    if (isObject(this.option) || this.option === true) {
      const { position } = isBoolean(this.option)
        ? { position: DIRECTION.TOP_RIGHT }
        : this.option;
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
    if (
      (isObject(this.option) || this.option === true) &&
      !get(this.option, 'custom')
    ) {
      this.container.innerHTML = '';
      const ul = document.createElement('ul');
      ul.className = css(styles.ul);
      const data = this.getLegend();
      for (const [_index, key] of data.entries()) {
        const li = document.createElement('li');
        const value = key;
        li.className = css(styles.item);
        li.innerHTML = `
        <span class="${css(symbolStyle.symbol)} ${css(
          symbolStyle.line,
        )}" style="background: ${value.color};"></span> 
        <span class="${css(styles.name)}">${value.name}</span>`;
        ul.append(li);
        // TODO: 挪到 interaction 管理
        li.addEventListener('click', () => {
          const activated = li.style.opacity === '1' || !li.style.opacity;
          li.style.opacity = activated ? '0.5' : '1';
          key.activated = !activated;
          this.legendItemClick({
            name: value.name,
            activated: !activated,
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

  legendItemClick(props: { name: string; activated: boolean }) {
    if (props.activated) {
      this.inactivatedSet.delete(props.name);
    } else {
      this.inactivatedSet.add(props.name);
    }
    this.ctrl.emit(ChartEvent.LEGEND_ITEM_CLICK, props);
  }

  getLegend(): LegendItem[] {
    const data = this.ctrl.getData();
    return data
      .map(({ name, color }) => ({
        name,
        color,
        activated: !this.inactivatedSet.has(name),
      }))
      .filter(d => d.name);
  }
}
