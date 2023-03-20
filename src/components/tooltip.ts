import { StyleSheet, css } from 'aphrodite/no-important.js';
import {
  get,
  isArray,
  isBoolean,
  isElement,
  isFunction,
  isString,
} from 'lodash';
import placement from 'placement.js';

import {
  ChartEvent,
  TooltipItemActive,
  TooltipOpt,
  TooltipOption,
  TooltipValue,
} from '../types/index.js';
import { NOT_AVAILABLE } from '../utils/constant.js';
import { generateName, template } from '../utils/index.js';

import { BaseComponent } from './base.js';
import { symbolStyle } from './styles.js';

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    visibility: 'hidden',
    pointerEvents: 'none',
    padding: '12px',
    boxShadow: '0 2px 8px #00000029',
    margin: 8,
    zIndex: 999,
    transition: 'transform 0.1s ease-out 0s',
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
    padding: '2px 8px',
    display: 'flex',
    alignItems: 'center',
  },
  'tooltip-marker': {
    marginRight: 4,
  },
  'tooltip-name': {
    maxWidth: '197px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  'tooltip-value': {
    marginLeft: 30,
    flex: 1,
    textAlign: 'right',
    whiteSpace: 'nowrap',
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
    this.option = get(this.ctrl.getOption(), this.name);
    this.createItem();
  }

  create() {
    if (!isBoolean(this.option)) {
      if (!this.container) {
        const { popupContainer } = this.option;
        const overlay = document.createElement('div');
        overlay.className = `${generateName('tooltip')} ${css(styles.overlay)}`;
        (popupContainer || document.body).append(overlay);
        this.container = overlay;
      }
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
    const isEl = isElement(itemTpl);
    const list = `<ul class="${css(styles['tooltip-list'])}">${itemTpl}</ul>`;
    this.container.innerHTML = `
      ${this.getTooltipTitle(title, values)}
      ${isEl ? '' : list}
    `;
    if (isEl) {
      this.container.remove();
      this.container.append(itemTpl);
    }
  }

  private getTooltipTitle(title: string, values: TooltipValue[]) {
    const { showTitle, titleFormatter } = this.option as TooltipOpt;
    if (String(showTitle) === 'false') {
      return '';
    }
    let tpl: string = title || NOT_AVAILABLE;
    if (isString(titleFormatter)) {
      tpl = template(titleFormatter, { title });
    }
    if (isFunction(titleFormatter)) {
      tpl = titleFormatter(title, values);
    }
    return `<div class="${css(styles['tooltip-title'])}">${tpl}</div>`;
  }

  private getTooltipItem(values?: TooltipValue[]): string | Element {
    if (!values || !values?.length) {
      return '';
    }
    const { nameFormatter, valueFormatter, itemFormatter, sort } = this
      .option as TooltipOpt;
    let items = sort ? values.sort(sort) : values;
    if (itemFormatter) {
      const itemValue = itemFormatter(items);
      if (isString(itemValue)) {
        return itemValue;
      }
      if (isElement(itemValue)) {
        return (itemValue as HTMLElement).innerHTML;
      }
      if (isArray(itemValue)) {
        items = itemValue;
      }
    }
    return items
      ?.map(item => {
        const value = this.handleTemplateString(item.value, valueFormatter);
        const name = this.handleTemplateString(
          String(item.name),
          nameFormatter,
        );

        return `<li class="${css(
          styles['tooltip-list-item'],
        )}" style="background: ${
          item.activated ? this.ctrl.getTheme().tooltip.activeBg : 'unset'
        }">
            <span class="${css(symbolStyle.symbol)} ${css(
          symbolStyle.line,
        )}" style="background: ${item.color};"></span>
            <span class="${generateName('tooltip-name')} ${css(
          styles['tooltip-name'],
        )}">${name || NOT_AVAILABLE}</span>
            <span class="${generateName('tooltip-value')} ${css(
          styles['tooltip-value'],
        )}">${value || NOT_AVAILABLE}</span>
          </li>`;
      })
      .join('');
  }

  handleTemplateString(text: string | number, formatter: string | Function) {
    let value = text;
    if (isString(formatter)) {
      value = template(formatter, { value: text });
    }
    if (isFunction(formatter)) {
      value = formatter(value);
    }
    return value;
  }

  public showTooltip = () => {
    this.container.style.visibility = 'visible';
    this.container.style.background = this.ctrl.getTheme().tooltip.background;
    this.container.style.color = this.ctrl.getTheme().tooltip.color;
  };

  public hideTooltip = () => {
    if (this.container) {
      this.container.style.visibility = 'hidden';
    }
  };

  /**
   * 添加事件监听
   */
  private eventListener() {
    // TODO: 是否纳管到 interaction
    this.ctrl.on(
      ChartEvent.U_PLOT_SET_CURSOR,
      ({ anchor, title, values }: TooltipItemActive) => {
        // console.log(anchor)
        // @ts-ignore
        placement(anchor, this.container, {
          placement: 'right',
        });
        this.createItem(title, values);
      },
    );
  }
}
