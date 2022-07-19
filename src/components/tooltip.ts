import { isFunction, noop } from 'lodash';

import { UIController } from '../abstract/index.js';
import { View } from '../chart/index.js';
import { CLASS_NAME } from '../constant.js';
import {
  AxisTooltipStrategy,
  ItemTooltipStrategy,
  NoneTooltipStrategy,
  TooltipStrategy,
} from '../service/index.js';
import {
  ChartData,
  D3Selection,
  TooltipContext,
  TooltipContextItem,
  TooltipOption,
} from '../types/index.js';
import { isHtml, rgbColor, template } from '../utils/index.js';

export class Tooltip extends UIController<TooltipOption> {
  container!: D3Selection;
  rectElement!: D3Selection;

  crosshairLine!: D3Selection;

  title!: D3Selection;

  list!: D3Selection;

  activeName: string | null;

  get name() {
    return 'tooltip';
  }

  get isRotated() {
    return !!this.owner.isRotated;
  }

  strategy: TooltipStrategy;

  constructor(view: View) {
    super(view);
    this.option = view.options.tooltip || {};
    this.setStrategy(view);
  }

  setStrategy(view: View) {
    const option = view.options.tooltip;
    if (option?.trigger === 'item') {
      this.strategy = new ItemTooltipStrategy(view);
    } else if (option?.trigger === 'none') {
      this.strategy = new NoneTooltipStrategy(view);
    } else {
      this.strategy = new AxisTooltipStrategy(view);
    }
    // TODO: 加上自动更新上一次注册的 strategy 配置信息 @zangguodong
  }

  mountPaths(
    paths: d3.Selection<any, ChartData, any, any>,
    panel: D3Selection,
  ) {
    this.strategy?.registerPaths(paths, panel);
  }

  init() {
    this.initTooltip();
    this.initCrosshairLine();
  }

  render() {
    this.resize();
    this.renderTooltipTemplate();
  }

  destroy = noop;

  update() {
    this.resize();
  }

  setActive(name: string | null) {
    this.activeName = name;
  }

  private initTooltip() {
    if (!this.owner.chartEle.tooltip || this.owner.chartEle.tooltip.empty()) {
      this.container = this.owner.chartEle.chart
        .style('position', 'relative')
        .append('div')
        .attr('class', CLASS_NAME.tooltip)
        .style('position', 'absolute')
        .style('pointer-events', 'none')
        .style('display', 'none');
      this.owner.chartEle.tooltip = this.container;
    }
  }

  private initCrosshairLine() {
    const crosshairContainer = this.owner.chartEle.main
      .append('g')
      .attr('class', CLASS_NAME.crosshair);
    this.crosshairLine = crosshairContainer
      .append('line')
      .style('pointer-events', 'none');
  }

  resize() {
    const { width, height } = this.owner.size.grid;
    this.owner.chartEle.main
      .selectAll(`.${CLASS_NAME.eventRect}`)
      .attr('y', this.owner.headerTotalHeight)
      .attr('width', width > 0 ? width : 0)
      .attr('height', height > 0 ? height : 0);
  }

  updateCrosshairLine(x: number) {
    const { width, height } = this.owner.size.main;
    const h = this.isRotated ? width : height;
    this.crosshairLine
      .attr(`${this.isRotated ? 'y1' : 'x1'}`, x)
      .attr(`${this.isRotated ? 'y2' : 'x2'}`, x)
      .attr(`${this.isRotated ? 'x1' : 'y1'}`, this.owner.headerTotalHeight)
      .attr(`${this.isRotated ? 'x2' : 'y2'}`, h)
      .attr('stroke', rgbColor('n-5'))
      .attr('stroke-dasharray', '3 2');
  }

  setVisibility(show = true) {
    if (this.owner.noData && show) {
      return;
    }
    this.container.style('display', show ? '' : 'none');
    this.crosshairLine.attr('visibility', show ? 'visible' : 'hidden');
  }

  private renderTooltipTemplate() {
    if (!this.option.hideTitle) {
      this.title = this.container
        .append('div')
        .attr('class', CLASS_NAME.tooltipTitle);
    }
    this.list = this.container
      .append('ul')
      .attr('class', CLASS_NAME.tooltipList);
  }

  setTooltipContext(
    {
      offsetX,
      offsetY,
      event,
    }: { offsetX: number; offsetY: number; event: MouseEvent },
    content: TooltipContext,
  ) {
    this.setTitle(content);
    this.list.html(this.getTooltipItemHtml(content.values));
    // this.container
    // .style('display', '')
    // .style('left', `${offsetX}px`)
    // .style('top', `${offsetY}px`);

    // return
    const { width, height } = (
      this.container.node() as HTMLElement
    ).getBoundingClientRect();
    const mainW = this.owner.size.main.width;
    const windowH = document.documentElement.clientHeight;
    const { x: vX = 0, y: vY = 0 } = this.owner.options.offset;
    const { margin } = this.owner.basics;
    const marginX = margin.left + 20 + vX;
    const tipMargin = width / 2 + vX;
    const x = this.isRotated ? offsetY + tipMargin + 10 : offsetX + marginX;
    const y = this.isRotated
      ? offsetX + vY
      : offsetY + vY + this.owner.options.grid.top;

    const eventTop = (event.target as HTMLElement).getBoundingClientRect().top;
    // 实际tip top 的位置
    const actualY = event.clientY - (event.pageY - eventTop);
    // tip 底部的位置
    const tipBottom = actualY + height + (event.pageY - eventTop);
    const top =
      tipBottom > windowH
        ? windowH -
          height -
          this.owner.chartEle.main.node().getBoundingClientRect().top
        : y;

    const left = x + width > mainW ? x - (width + 20) : x;

    this.container
      .style('display', '')
      .style('left', `${left}px`)
      .style('top', `${top}px`);
  }

  private setTitle(context: TooltipContext) {
    if (this.option.hideTitle) {
      return;
    }
    const { titleFormatter } = this.option;
    if (!titleFormatter) {
      this.title.text(context.title as string);
      return;
    }
    if (isFunction(titleFormatter)) {
      this.title.html(titleFormatter(context));
      return;
    }
    this.title.text(template(titleFormatter, context));
  }

  private getTooltipItemHtml(items?: TooltipContextItem[]) {
    if (!items) {
      return '';
    }
    const values = this.option.sort ? items.sort(this.option.sort) : items;
    const { itemFormatter } = this.option;
    if (itemFormatter) {
      const data = itemFormatter(values);
      return !isHtml(data) && Array.isArray(data)
        ? this.generateTooltipItem(data)
        : data;
    }
    return this.generateTooltipItem(values);
  }

  getItemValue(
    value: number | string,
    data: TooltipContextItem,
    formatter: string | ((value: TooltipContextItem) => string),
  ) {
    return isFunction(formatter)
      ? formatter(data) || value
      : template(formatter, data) || value;
  }

  getTooltipContext(
    index: number,
    xValue: Date | number | string,
  ): TooltipContext {
    const values: TooltipContextItem[] =
      this.owner.isBar && this.owner.isGroup
        ? this.owner.chartData[index]?.values.map(d => ({
            ...d,
            x: d.x as string,
            name: d.x as string,
            color: d.color,
            activated: d.x === this.activeName,
          }))
        : this.owner.chartData.reduce(
            (acc: TooltipContextItem[], cur: ChartData) => {
              const item = cur.values[index];
              return [
                ...acc,
                {
                  ...item,
                  name: cur.name,
                  color: cur.color,
                  activated: cur.name === this.activeName,
                },
              ] as TooltipContextItem[];
            },
            [],
          );
    return {
      title: xValue,
      values,
    };
  }

  private readonly generateTooltipItem = (values: TooltipContextItem[]) => {
    const { nameFormatter, valueFormatter } = this.option;
    const isCircle = ['pie', 'scatter'].includes(this.owner.options.type);
    return values
      .map(
        d => `<li class="${CLASS_NAME.tooltipListItem} ${
          d.activated ? CLASS_NAME.tooltipListItemActivated : ''
        }">
    <div class="ac-tooltip-left">
      <span class="ac-tooltip-icon ${
        isCircle ? 'ac-tooltip-icon-circle' : ''
      }" style="background: ${d.color}"></span>
      <span class="ac-tooltip-name">${this.getItemValue(
        d.name,
        d,
        nameFormatter,
      )}</span>
    </div>
    <div class="ac-tooltip-right">
      <span class="ac-tooltip-text">${this.getItemValue(
        d.y,
        d,
        valueFormatter,
      )}</span>
    </div>
  </li>`,
      )
      .join('');
  };
}
