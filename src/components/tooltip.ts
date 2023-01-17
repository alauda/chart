import { StyleSheet, css } from 'aphrodite/no-important.js';
import { get, isBoolean, isFunction, isString } from 'lodash';
import placement from 'placement.js';

import {
  TooltipItemActive,
  TooltipOpt,
  TooltipOption,
  TooltipValue,
} from '../types/index.js';
import { CHART_EVENTS, NOT_AVAILABLE } from '../utils/constant.js';
import { generateName, template } from '../utils/index.js';

import { BaseComponent } from './base.js';
import { symbolStyle } from './styles.js';

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    visibility: 'hidden',
    pointerEvents: 'none',
    padding: '12px',
    opacity: 0.95,
    backgroundColor: '#fff',
    boxShadow: '0 2px 8px #00000029',
    margin: 8,
    color: '#646669',
    zIndex: 999,
    // transition:
    //   'top 0.3s cubic-bezier(0.23, 1, 0.32, 1) 0s',
    fontSize: 12,
  },
  'tooltip-title': {
    marginBottom: 8,
  },
  'tooltip-list': {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  'tooltip-list-item': {
    listStyleType: 'none',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
  },
  'tooltip-marker': {
    marginRight: 4,
  },
  'tooltip-value': {
    marginLeft: 30,
    flex: 1,
    textAlign: 'right',
  },
});

export class Tooltip extends BaseComponent<TooltipOption> {
  get name(): string {
    return 'tooltip';
  }

  render() {
    const opt = this.ctrl.getOption();
    this.option = get(opt, this.name, {});
    this.create();
  }

  update() {
    // ..
  }

  create() {
    if (!isBoolean(this.option)) {
      const overlay = document.createElement('div');
      overlay.className = `${generateName('tooltip')} ${css(styles.overlay)}`;
      document.body.append(overlay);
      this.container = overlay;
      this.createItem();
      this.eventListener();
    }
  }

  /**
   * 创建 tooltip item
   * @param title
   * @param values
   */
  private createItem(title?: string, values?: TooltipValue[]) {
    const itemTpl = this.getTooltipItem(values);
    this.container.innerHTML = `
      ${this.getTooltipTitle(title)}
      <ul class="${css(styles['tooltip-list'])}">
        ${itemTpl}
      </ul>
    `;
  }

  private getTooltipTitle(title?: string) {
    const { showTitle, titleFormatter } = this.option as TooltipOpt;
    if (String(showTitle) === 'false') {
      return '';
    }
    let tpl: string = title || NOT_AVAILABLE;
    if (isString(titleFormatter)) {
      tpl = template(titleFormatter, { title });
    }
    if (isFunction(titleFormatter)) {
      tpl = titleFormatter(title);
    }
    return `<div class="${css(styles['tooltip-title'])}">${tpl}</div>`;
  }

  private getTooltipItem(values?: TooltipValue[]) {
    const { valueFormatter } = this.option as TooltipOpt;
    return values
      ?.map(item => {
        let value = String(item.value);
        if (isString(valueFormatter)) {
          value = template(valueFormatter, { value: item.value });
        }
        if (isFunction(valueFormatter)) {
          value = valueFormatter(item);
        }
        return `<li class="${css(styles['tooltip-list-item'])}">
            <span class="${css(symbolStyle.symbol)} ${css(
          symbolStyle.line,
        )}" style="background: ${item.color};"></span>
            <span class="tooltip-name">${item.name || NOT_AVAILABLE}</span>
            <span class="${css(styles['tooltip-value'])}">${
          value || NOT_AVAILABLE
        }</span>
          </li>`;
      })
      .join('');
  }

  /**
   * 添加事件监听
   */
  private eventListener() {
    this.ctrl.on(
      CHART_EVENTS.U_PLOT_SET_CURSOR,
      ({ anchor, title, values }: TooltipItemActive) => {
        // @ts-ignore
        placement(this.container, anchor, 'right', 'start', {
          bound: document.querySelector('body'),
        });
        this.createItem(title, values);
      },
    );

    this.ctrl.on(CHART_EVENTS.U_PLOT_OVER_MOUSEENTER, () => {
      this.container.style.visibility = 'visible';
    });

    this.ctrl.on(CHART_EVENTS.U_PLOT_OVER_MOUSELEAVE, () => {
      this.container.style.visibility = 'hidden';
    });
  }
}
