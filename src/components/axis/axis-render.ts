import { axisBottom, axisLeft, AxisScale, format } from 'd3';
import { isFunction, isNumber } from 'lodash';

import { UIController } from '../../abstract';
import View from '../../chart/view';
import { CLASS_NAME, STROKE_DASHARRAY } from '../../constant';
import { AxisOption, D3Selection } from '../../types';
import { template } from '../../utils';

interface config {
  range: number[];
  orient: string;
}

interface AxisRenderProps {
  name: string;
  config: config;
  g: D3Selection;
  owner: View;
  option: AxisOption;
  isRotated: boolean;
}

export default class AxisRender extends UIController<AxisOption> {
  config!: config;

  g: D3Selection;

  name: string;

  isRotated: boolean;

  tickConfig!: {
    tickWidth: number;
    size: number;
  };

  get isXAxis() {
    return this.name === 'x';
  }

  get isYAxis() {
    return this.name === 'y';
  }

  constructor({ config, g, option, owner, name, isRotated }: AxisRenderProps) {
    super(owner);
    this.config = config;
    this.g = g;
    this.name = name;
    this.option = option;
    this.isRotated = isRotated;
  }

  init() {
    // ..
  }

  render() {
    this.updateTick();
  }

  destroy() {
    // ..
  }

  updateTick() {
    this.updateConfig();
    const { orient } = this.config;
    const isBottom = orient === 'bottom';
    const { x, y, isGroup, xSeriesValue } = this.owner.getController('scale');
    const scale = isBottom ? x : y;
    const d3Axis = isBottom
      ? this.isRotated
        ? axisLeft
        : axisBottom
      : this.isRotated
      ? axisBottom
      : axisLeft;

    const maxTicks = this.getMaxTicks();
    let axis = d3Axis(scale as AxisScale<any>).ticks(maxTicks);
    // TODO: 优化 ticks
    // if (xSeriesValue.every(d => typeof d === 'number') && this.isYAxis) {
    //   const tickValues = getNiceTickValues(yDomain, maxTicks);
    //   console.log(yDomain)
    //   axis = axis.tickValues(tickValues);
    // }
    if (this.owner.isBar && !isGroup && this.isXAxis) {
      axis = axis.tickValues(
        xSeriesValue.filter(
          (_, i) =>
            !(
              i % Math.floor((100 * xSeriesValue.length) / this.tickConfig.size)
            ),
        ),
      );
    }

    const { tickFormatter } = this.option;
    if (tickFormatter) {
      axis.tickFormat((value: number) => {
        if (isFunction(tickFormatter)) {
          const formatter = tickFormatter(value);
          return isFunction(formatter) ? formatter(value) : formatter;
        }
        return template(tickFormatter, { value });
      });
    }

    if (!tickFormatter && d3Axis === axisLeft) {
      axis.tickFormat((value: string) => {
        return isNumber(value) ? format('d')(value) : value;
      });
    }
    this.g
      .attr('class', this.isXAxis ? CLASS_NAME.xAxis : CLASS_NAME.yAxis)
      .call(this.isXAxis ? axis.tickSizeOuter(0) : axis);

    if (!this.isXAxis) {
      this.adjustXAxis();
    }

    if (d3Axis === axisBottom) {
      this.g.call(g => {
        const lastTick = g.selectAll('.tick:last-child');
        const { width } = this.owner.size.grid;
        const text = lastTick.select('text');
        if (lastTick?.size()) {
          const x = Number(lastTick?.attr('transform').replace(/[^0-9\-,.]/g, '').split(',')[0]);
          const textWidth = (text.node() as SVGTextElement)?.getBBox()?.width;
          const textX = x + textWidth / 2;
          const left = textX > width ? textX - width : 0;
          text.attr('x', -left);
        }
        return g;
      });
    }
  }

  adjustXAxis() {
    const { width, height: gridH } = this.owner.size.grid;
    const { height } = this.owner.size.main;
    const w = this.isRotated ? -gridH : width;
    const h = this.isRotated ? width : height;
    this.g.selectAll('.tick-line').remove();
    this.g
      .call(g => {
        return g
          .select('.domain')
          .attr('d', `M-6,${h}H0V${this.owner.headerTotalHeight}H0`);
      })
      .call(g => {
        const line = g.selectAll('.tick line');
        const tickLine = line.clone();
        line.attr('class', 'tick-aim');
        return tickLine
          .attr(`${this.isRotated ? 'y1' : 'x2'}`, w)
          .attr('class', 'tick-line')
          .attr('opacity', 1)
          .style('pointer-events', 'none')
          .attr('stroke-dasharray', STROKE_DASHARRAY);
      });
  }

  updateConfig() {
    const { width, height } = this.owner.size.main;
    const w = this.isRotated ? height : width;
    const h = this.isRotated ? width : height;
    this.tickConfig =
      this.name === 'x'
        ? { tickWidth: 100, size: w }
        : { tickWidth: 40, size: h };
  }

  getMaxTicks(): number {
    return Math.floor(this.tickConfig.size / this.tickConfig.tickWidth);
  }
}
