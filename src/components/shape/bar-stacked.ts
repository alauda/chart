import { select } from 'd3';
import * as d3 from 'd3';

import { ChartEvent } from '../../types/index.js';
import { BarStackedShapeOption } from '../../types/options.js';
import {
  createSvg,
  generateName,
  PolarShapeType,
} from '../../utils/index.js';

import { PolarShape } from './index.js';
import { get, isNumber } from 'lodash-es';
import { Legend } from '../legend.js';
import { measureText } from '../../strategy/utils.js';
import { UPLOT_DEFAULT_OPTIONS } from '../../strategy/config.js';
import { Tooltip } from '../tooltip.js';

/**
 * 堆叠 柱状图
 */
export default class BarStacked extends PolarShape<BarStackedShapeOption> {
  override type = PolarShapeType.BarStacked;

  pieGuide!: d3.Selection<HTMLDivElement, unknown, null, undefined>;
  svgEl: d3.Selection<SVGSVGElement, unknown, null, undefined>;

  data = this.getData();

  get nullData() {
    return this.data.every(d => !isNumber(d.value));
  }

  get totalValue() {
    return this.data.reduce((prev, item) => prev + item.value, 0);
  }

  get colorVar() {
    return this.ctrl.getTheme().colorVar;
  }
  size: {
    width: number;
    height: number;
  } = {
    width: 0,
    height: 0,
  };

  margin = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  init() {
    // do nothing.
  }

  getTextsWidth(texts: string[]) {
    const widths = texts.map(text => measureText(text, 14).width);
    return Math.max(...widths);
  }

  render() {
    this.ctrl.container.style.display = 'flex';
    this.ctrl.container.style.flexDirection = 'column';
    this.option = get(this.ctrl.getOption(), this.type, {});
    this.svgEl = this.svgEl || createSvg(select(this.ctrl.container));
    this.container = this.container || this.svgEl.append('g');
    this.categories = get(this.ctrl.getOption(), 'axis.x.categories', []) || [];

    this.margin = {
      top: 16,
      right: 0,
      bottom: 0,
      left: this.getTextsWidth(this.categories),
    };

    const legendRef = this.ctrl.components.get('legend') as Legend;
    this.ctrl.emit(ChartEvent.U_PLOT_READY);
    setTimeout(() => {
      const { clientWidth, clientHeight } = this.ctrl.container;
      const legendEl = this.ctrl.chartContainer.querySelector(
        `.${generateName('legend')}`,
      );
      const position: string = get(
        this.ctrl.getOption().legend,
        'position',
        '',
      );
      const chartWidth = clientWidth - this.margin.left - this.margin.right;
      const chartHeight = clientHeight - this.margin.bottom - this.margin.top;
      this.container.attr(
        'transform',
        `translate(${this.margin.left},${this.margin.top})`,
      );

      const legendH = position.includes('bottom') ? legendEl?.clientHeight : 0;
      const headerH =
        this.ctrl.chartContainer.querySelector(`.${generateName('header')}`)
          ?.clientHeight || 0;
      const height = chartHeight - legendH - headerH;
      this.size = {
        width: chartWidth,
        height,
      };
      this.renderBar(chartWidth, height);
      this.addListener();
      // this.renderLabel();
      this.ctrl.on(ChartEvent.LEGEND_ITEM_CLICK, () => {
        this.data = this.getData().filter(
          d => !legendRef.inactivatedSet.has(d.name),
        );
        this.renderBar(chartWidth, height);
        this.addListener();
      });
    });
  }

  legendRef: Legend;
  yScale: d3.ScaleBand<any>;
  categories: string[];
  renderBar(clientWidth: number, clientHeight: number) {
    this.legendRef = this.ctrl.components.get('legend') as Legend;
    this.yScale = d3
      .scaleBand()
      .domain(this.categories)
      .range([0, clientHeight])
      .padding(0.25);

    this.updateBar(clientWidth, clientHeight);
  }

  updateBar(width: number, height: number) {
    this.container.selectAll('*').remove();

    const data = this.getData();
    // 过滤掉隐藏的系列
    const visibleSeries = data.filter(
      s => !this.legendRef.inactivatedSet.has(s.name),
    );
    const stackGroups = d3.group(visibleSeries, d => d.stack || d.name);
    const groupCount = stackGroups.size;
    const band = this.yScale.bandwidth();
    let barH = this.option.barWidth ? this.option.barWidth : band;
    barH = Math.max(1, barH);
    const groupHeight = (barH / groupCount) * 0.8; // 给堆叠组之间留空隙
    const groupPadding = (barH / groupCount) * 0.5;

    const maxValue =
      d3.max(this.categories, (_cat, i) => {
        let maxForCat = 0;

        for (let [_stackName, items] of stackGroups) {
          const sum = items.reduce((s, item) => s + item.values[i].y, 0);
          maxForCat = Math.max(maxForCat, sum);
        }
        return maxForCat;
      }) || 0;
    const x = d3.scaleLinear().domain([0, maxValue]).range([0, width]).nice();

    // X 轴
    this.container
      .append('g')
      .attr('class', 'x-grid')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(-height))
      .call(g =>
        g
          .selectAll('line')
          .attr('stroke', this.ctrl.getTheme().yAxis.gridStroke)
          .attr('stroke-dasharray', '4,4'),
      )
      .selectAll('text')
      .style('font', UPLOT_DEFAULT_OPTIONS.axes[0].font)
      .each(function (_d, i, nodes) {
        if (i === nodes.length - 1) {
          const text = d3.select(this);
          const self = this as any;
          const bb = self.getBBox();

          const tickG = d3.select(self.parentNode);
          const transform = tickG.attr('transform');
          const tx = +transform.match(/translate\(([^,]+)/)[1];

          const tickRight = tx + bb.width / 2;
          const chartRight = width;

          if (tickRight > chartRight) {
            const shift = chartRight - tickRight - 2;
            text.attr('dx', shift);
          }
        }
      });

    let groupIndex = 0;
    for (let [stackName, items] of stackGroups) {
      const keys = items.map(s => s.name);
      const data = this.categories.map((cat, i) => {
        const obj: Record<string, any> = { category: cat };
        items.forEach(s => {
          obj[s.name] = s.values[i].y;
          obj.color = s.color;
        });
        return obj;
      });
      const stack = d3.stack().keys(keys);
      const stackedSeries = stack(data);
      this.container
        .selectAll(`g.stack-${stackName}`)
        .data(stackedSeries)
        .join('g')
        .attr('fill', d => {
          const value = items.find(item => item.name === d.key);
          return value?.color || this.ctrl.color.getChartColor(value.name || d.key);
        })
        .selectAll('rect')
        .data(d => d)
        .join('rect')
        .attr('y', d => {
          return (
            this.yScale(d.data.category) +
            band / 2 -
            groupHeight -
            groupPadding / 2 +
            groupIndex * (groupHeight + groupPadding)
          );
        })
        .attr('x', d => x(d[0]))
        .attr('width', d => x(d[1]) - x(d[0]))
        .attr('height', groupHeight);

      groupIndex++;
    }

    // Y 轴
    this.container
      .append('g')
      .call(d3.axisLeft(this.yScale))
      .selectAll('text')
      .style('font', UPLOT_DEFAULT_OPTIONS.axes[1].font);

    this.container
      .selectAll('text')
      .style('fill', this.ctrl.getTheme().yAxis.stroke);
    this.container
      .selectAll('line')
      .style('stroke', this.ctrl.getTheme().yAxis.tickStroke);

    this.container
      .selectAll('.domain')
      .style('stroke', this.ctrl.getTheme().yAxis.gridStroke);
  }

  private cursor: HTMLElement;

  addListener() {
    const ctrl = this.ctrl;
    this.cursor = document.createElement('div');
    this.cursor.className = 'cursor';
    this.cursor.style.position = 'absolute';
    this.cursor.style.top = '0';
    this.cursor.style.left = '0';
    this.ctrl.container.appendChild(this.cursor);
    this.container
      .selectAll('rect.overlay')
      .data(this.categories)
      .join('rect')
      .attr('class', 'overlay')
      .attr('x', 0)
      .attr('y', d => this.yScale(d))
      .attr('width', this.size.width)
      .attr('height', this.yScale.bandwidth())
      .attr('fill', 'transparent')
      .on('mousemove', (event, name) => {
        this.cursor.style.transform = `translate(${event.offsetX}px,${event.offsetY}px)`;
        const i = this.categories.indexOf(name);
        const dd = this.data.map(item => {
          return { ...item, value: item.values[i].y };
        });
        ctrl.emit(ChartEvent.ELEMENT_MOUSEMOVE, {
          self: this as unknown,
          event,
          data: dd,
        });
        if (!ctrl.hideTooltip) {
          ctrl.emit(ChartEvent.U_PLOT_SET_CURSOR, {
            anchor: this.cursor || event.target,
            title: name,
            values: dd,
          });
          (ctrl.components.get('tooltip') as Tooltip).showTooltip();
        }
      })
      .on('mouseout', () => {
        if (!ctrl.hideTooltip) {
          (ctrl.components.get('tooltip') as Tooltip).hideTooltip();
        }
      });
  }

  redraw() {}
}
