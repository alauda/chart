import {
  area,
  curveMonotoneX,
  line,
  ScaleBand,
  ScaleLinear,
  ScaleTime,
  select,
  Selection,
} from 'd3';

import { UIController } from '../abstract';
import { View } from '../chart';
import {
  CLASS_NAME,
  DEFAULT_LINE_WIDTH,
  DEFAULT_SCATTER_OPTIONS,
  GRADIENT_PREFIX,
  STROKE_WIDTH,
} from '../constant';
import {
  AreaSeriesOption,
  BarSeriesOption,
  ChartData,
  ChartType,
  D3ChartSelection,
  D3Selection,
  Data,
  LineSeriesOption,
  ScatterOption,
  XData,
} from '../types';
import { abs, defined, removeSymbol } from '../utils';

function handleData(d: ChartData) {
  return d.values
    .filter(d => d.y)
    .map(item => ({
      ...item,
      name: d.name,
      total: d.values.filter(d => d.y)?.length,
    }));
}

export class Series extends UIController {
  eventContainer!: D3Selection;

  type: ChartType;

  container!: D3Selection;

  get name(): string {
    return 'series';
  }

  get isStack() {
    return (this.option as BarSeriesOption).stack;
  }

  get isRotated() {
    return this.owner.isRotated;
  }

  get isGroup() {
    return (this.option as BarSeriesOption).isGroup;
  }

  constructor(view: View) {
    super(view);
    this.type = view.options.type || 'line';
    this.option = view.options.seriesOption || {};
  }

  init() {
    const main = this.owner.chartEle.main;
    main.append('g').attr('class', CLASS_NAME.chart);
    this.container = this.owner.chartEle.main
      .select(`.${CLASS_NAME.chart}`)
      .append('g')
      .attr('class', CLASS_NAME[`${this.type}s`]);

    // create event rect
    this.eventContainer = this.owner.chartEle.main
      .select(`.${CLASS_NAME.chart}`)
      .append('g')
      .attr('class', CLASS_NAME.eventRect)
      .style('fill-opacity', '0');
    this.eventContainer
      .append('rect')
      .attr('class', CLASS_NAME.eventRect)
      .attr('width', this.owner.size.grid.width)
      .attr('height', this.owner.size.grid.height);
  }

  render() {
    this.updateSeries();
  }

  updateSeries() {
    this.type = this.owner.options.type || 'line';
    // create event rect
    // 会有切换area 变 line， 每次update 删除area
    this.container.selectAll(`.${CLASS_NAME.area}`).remove();
    this.eventContainer
      .select(`rect.${CLASS_NAME.chart}`)
      .attr('class', CLASS_NAME.eventRect)
      .attr('width', this.owner.size.grid.width)
      .attr('height', this.owner.size.grid.height);
    switch (this.type) {
      case 'line':
        this.updateLineSeries();
        this.updateLineSeries(true);
        break;
      case 'area':
        this.updateLineSeries();
        this.updateLineSeries(true);
        this.updateAreaSeries();
        break;
      case 'bar':
        if (this.isGroup) {
          this.updateBarSeries();
          this.updateBarSeries(true);
        } else {
          this.updateDefaultBarSeries();
          this.updateDefaultBarSeries(true);
        }
        break;
      case 'scatter':
        this.updateScatterSeries();
        this.updateScatterSeries(true);
        break;
      default:
        break;
    }
  }

  destroy() {
    // ..
  }

  private updateLineSeries(isClone?: boolean) {
    const container = isClone ? this.eventContainer : this.container;
    const className = isClone ? CLASS_NAME.cloneLine : CLASS_NAME.line;
    const line = container
      .selectAll(`.${className}`)
      .data(this.owner.chartData);

    line.exit().remove();

    const res = line
      .enter()
      .append('g')
      .attr('class', d => `${className} ${className}-${removeSymbol(d.name)}`)
      .merge(line as D3ChartSelection)
      .text(d => removeSymbol(d.name));
    const lineG = this.getLineGenerator();
    const path = res
      .append('path')
      .attr('fill', 'none')
      .attr(
        STROKE_WIDTH,
        (this.option as LineSeriesOption).lineWidth || DEFAULT_LINE_WIDTH,
      )
      .attr('stroke', d => d.color || '000')
      .attr('d', d => lineG(d.values));
    if (isClone) {
      path.attr('opacity', 0).attr(STROKE_WIDTH, 10);
      this.owner
        .getController('tooltip')
        ?.mountPaths(path, this.eventContainer);
    }
  }

  private updateAreaSeries() {
    const area = this.container
      .selectAll(`.${CLASS_NAME.area}`)
      .data(this.owner.chartData);

    area.exit().remove();

    const res = area
      .enter()
      .append('g')
      .attr('class', CLASS_NAME.area)
      .merge(area as D3ChartSelection)
      .text(d => removeSymbol(d.name))
      .each((d, index, el) => {
        const id = `${GRADIENT_PREFIX}${removeSymbol(d.name)}-${
          this.owner.chartUId
        }`;
        this.createGradient(d, select(el[index]), id);
      });

    const areaG = this.getAraGenerator();
    res
      .append('path')
      .attr('fill', 'none')
      .attr(STROKE_WIDTH, 1)
      .attr('d', d => areaG(d.values))
      .attr(
        'fill',
        d =>
          `url(#${GRADIENT_PREFIX}${removeSymbol(d.name)}-${
            this.owner.chartUId
          })`,
      )
      .raise();
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  private updateBarSeries(isClone?: boolean) {
    const container = isClone ? this.eventContainer : this.container;
    const className = isClone ? CLASS_NAME.cloneBar : CLASS_NAME.bar;

    const bar = container.selectAll(`.${className}`).data(this.owner.chartData);

    bar.exit().remove();

    const barRes = bar
      .enter()
      .append('g')
      .attr('class', className)
      .merge(bar as D3ChartSelection)
      .text(d => d.name);

    const barRectItem = barRes
      .selectAll(`.${className}`)
      .data(handleData)
      .enter()
      .append('rect')
      .attr('class', CLASS_NAME.barItem);

    const {
      radius,
      bandwidth = 0,
      columnClick,
    } = this.option as BarSeriesOption;

    if (!isClone) {
      this.owner.getController('tooltip')?.mountPaths(bar, this.eventContainer);
    }

    if (isClone) {
      barRectItem.on('click', (_, d) => {
        columnClick?.({ name: d.x, value: d.y, color: d.color });
      });
    }

    const { xBarScale, x, y } = this.owner.getController('scale');
    const xScale = this.isStack ? (x as ScaleBand<string>) : xBarScale;
    barRes.attr('transform', d => {
      const value = (x as ScaleBand<string>)(d.name) || 0;
      const offsetX = this.isRotated ? 0 : value;
      const offsetY = this.isRotated ? value : 0;

      const width = bandwidth / 2;
      const rate = 0.5;
      const barPosition = (x as ScaleBand<string>).bandwidth() * rate - width;
      const offsetWidth = bandwidth
        ? this.isStack
          ? barPosition
          : barPosition / 3 - width
        : 0;
      return `translate(${this.isRotated ? 0 : offsetX + offsetWidth},${
        this.isRotated ? offsetY + offsetWidth : 0
      })`;
    });

    if (this.isStack) {
      const clipPath = barRes
        .append('defs')
        .selectAll(`.${className}`)
        .data(handleData)
        .enter()
        .append('clipPath');

      const clipRect = clipPath
        .attr(
          'id',
          d =>
            `bar-item-clip-${removeSymbol(d.name)}-${removeSymbol(
              d.x as string,
            )}`,
        )
        .append('rect');
      this.setBarItemAttr(barRectItem, xScale);
      this.setBarItemAttr(clipRect, xScale, true);
      return;
    }

    const { width, height } = this.owner.size.main;
    const h = this.isRotated ? width : height;
    barRectItem
      .attr(
        `${this.isRotated ? 'height' : 'width'}`,
        abs(bandwidth || xScale.bandwidth() || 0),
      )
      .attr('fill', d => d.color)
      .attr(`${this.isRotated ? 'y' : 'x'}`, d => xScale(d.x as string) || 0)
      .attr(`${this.isRotated ? 'width' : 'height'}`, d =>
        !d.y ? 0 : abs(this.isRotated ? y(d.y) : h - y(d.y) || 0),
      )
      .attr('rx', radius)
      .attr(`${this.isRotated ? 'x' : 'y'}`, (d, index, target) =>
        this.handleRectXY(d, index, target, y),
      );
  }

  private updateScatterSeries(isClone?: boolean) {
    const container = isClone ? this.eventContainer : this.container;
    const className = isClone ? CLASS_NAME.cloneScatter : CLASS_NAME.scatter;
    const scatter = container
      .selectAll(`.${className}`)
      .data(this.owner.chartData);

    scatter.exit().remove();

    const scatterRes = scatter
      .enter()
      .append('g')
      .attr('class', d => `${className} ${className}-${removeSymbol(d.name)}`)
      .merge(scatter as D3ChartSelection)
      .text(d => removeSymbol(d.name));
    const { x, y } = this.owner.getController('scale');
    const scatterItem = scatterRes
      .selectAll(`.${className}`)
      .data(item =>
        item.values.map(d => ({
          pName: item.name,
          name: d.x,
          color: item.color,
          value: d.y,
          ...d,
        })),
      )
      .enter()
      .append('circle')
      .attr(
        'class',
        d =>
          `${CLASS_NAME.scatterItem} ${CLASS_NAME.scatterItem}-${removeSymbol(
            d.name as string,
          )}`,
      );

    const { size, type, opacity, minSize, maxSize } = this
      .option as ScatterOption;
    const def = DEFAULT_SCATTER_OPTIONS;
    const scatterItemCircle = scatterItem
      .attr('fill', 'none')
      .attr(
        STROKE_WIDTH,
        (this.option as LineSeriesOption).lineWidth || DEFAULT_LINE_WIDTH,
      )
      .attr('cx', d => (<ScaleTime<number, number>>x)(d.x as number))
      .attr('cy', d => y(d.y))
      .attr('r', d => {
        if (type === 'bubble') {
          const val = d.size || size || def.size;
          const min = Math.max(val, minSize || def.minSize);
          const max = Math.min(val, maxSize || def.maxSize);
          return Math.max(min, max);
        }
        return size;
      })
      .attr('fill', d => d.color)
      .attr('fill-opacity', type === 'bubble' ? opacity || def.opacity : 1)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 1);

    if (isClone) {
      scatterItemCircle.attr('opacity', 0).attr(STROKE_WIDTH, 10);
      this.owner
        .getController('tooltip')
        ?.mountPaths(
          scatterItemCircle as unknown as D3ChartSelection,
          this.eventContainer,
        );
    }
  }

  handleRectXY(
    d: any,
    index: number,
    target: SVGRectElement[] | ArrayLike<SVGRectElement>,
    y: ScaleLinear<number, number>,
  ) {
    const preTarget = target[index - 1];
    const curTarget = target[index];
    const preEl = index ? preTarget.getBBox() : { height: 0, y: 0 };
    if (this.isRotated && !this.isStack) {
      return 0;
    }
    if (this.isStack && this.isRotated) {
      return this.getStackX(preTarget, index);
    }
    return this.isStack
      ? index
        ? preEl.y - curTarget.getBBox().height
        : +y(d.y as number)
      : +y(d.y as number);
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  private setBarItemAttr(
    rect: Selection<
      SVGRectElement,
      {
        name: string;
        x: string | number | Date;
        y: number;
        color?: string;
        value?: number;
        total: number;
      },
      any,
      ChartData
    >,
    xScale: ScaleBand<string>,
    isClip?: boolean,
  ) {
    const {
      radius,
      bandwidth = 0,
      closeRadiusLadder,
    } = this.option as BarSeriesOption;
    const { y } = this.owner.getController('scale');
    const { width, height } = this.owner.size.main;
    const h = this.isRotated ? width : height;

    const itemsRect = rect
      .attr(
        `${this.isRotated ? 'height' : 'width'}`,
        abs(bandwidth || xScale.bandwidth() || 0),
      )
      .attr('fill', d => d.color)
      .attr(`${this.isRotated ? 'y' : 'x'}`, d => xScale(d.x as string) || 0)
      .attr(`${this.isRotated ? 'width' : 'height'}`, (d, index) => {
        let num = !isClip ? 0 : index + 1 === d.total ? 2 : 0;
        if (isClip && index === 0 && d.total !== 1 && this.isRotated) {
          num = -2.5;
        }
        return (
          (!d.y ? 0 : abs(this.isRotated ? y(d.y) : h - y(d.y))) + num || 0
        );
      })
      .attr(`${this.isRotated ? 'x' : 'y'}`, (d, index, target) =>
        this.handleRectXY(d, index, target, y),
      );

    if (!isClip && this.isStack) {
      itemsRect
        .attr('clip-path', (d, index) =>
          (!index && d.total === 1) || closeRadiusLadder
            ? ''
            : `url(#bar-item-clip-${removeSymbol(d.name)}-${removeSymbol(
                d.x as string,
              )})`,
        )
        .attr('rx', (_, index) => (index ? 0 : radius));
    } else {
      itemsRect.attr('rx', (d, index) =>
        !index ? 0 : index === d.total - 1 ? radius : radius - radius / 2,
      );
    }
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  private updateDefaultBarSeries(isClone?: boolean) {
    const container = isClone ? this.eventContainer : this.container;
    const className = isClone ? CLASS_NAME.cloneBar : CLASS_NAME.bar;
    const bar = container.selectAll(`.${className}`).data(this.owner.chartData);
    bar.exit().remove();

    const barRes = bar
      .enter()
      .append('g')
      .attr('class', className)
      .merge(bar as D3ChartSelection)
      .text(d => d.name);

    const barRectItem = barRes
      .selectAll(`.${className}`)
      .data(item =>
        item.values.map(d => ({
          name: d.x,
          color: item.color,
          value: d.y,
          ...d,
        })),
      )
      .enter()
      .append('rect')
      .attr('class', CLASS_NAME.barItem);

    const { x, y } = this.owner.getController('scale');
    const scaleX = <ScaleBand<string>>x;

    if (!isClone) {
      this.owner
        .getController('tooltip')
        ?.mountPaths(
          barRectItem as unknown as D3ChartSelection,
          this.eventContainer,
        );
    }
    const {
      radius,
      bandwidth = 0,
      columnClick,
    } = this.option as BarSeriesOption;

    if (isClone) {
      barRectItem.on('click', (_, d) => {
        columnClick?.(d);
      });
    }
    const { width, height } = this.owner.size.main;
    const h = this.isRotated ? width : height;
    barRectItem
      .attr('x', d => {
        const width = bandwidth ? (scaleX.bandwidth() - bandwidth) / 2 : 0;
        return this.isRotated ? 0 : scaleX(d.x as string) + width;
      })
      .attr('y', d => (this.isRotated ? scaleX(d.x as string) : y(d.y)))
      .attr(
        `${this.isRotated ? 'height' : 'width'}`,
        abs(bandwidth || scaleX.bandwidth()),
      )
      .attr(`${this.isRotated ? 'width' : 'height'}`, d =>
        abs(this.isRotated ? y(d.y) : h - y(d.y) || 0),
      )
      .attr('rx', radius || 0)
      .attr('fill', d => d.color);
  }

  private getStackX(pre: SVGRectElement, index: number) {
    return index ? pre.getBBox().width + pre.getBBox().x : 0;
  }

  private createGradient(data: ChartData, el: D3Selection, id: string) {
    const defs = el.append('defs');
    const linearGradient = defs.append('linearGradient').attr('id', id);
    const { startOpacity, endOpacity } = this.option as AreaSeriesOption;
    const opacity = startOpacity || 0.15;
    linearGradient
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    linearGradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-opacity', opacity)
      .attr('stop-color', data.color || '');

    linearGradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-opacity', endOpacity || 0)
      .attr('stop-color', data.color || '');
  }

  private getLineGenerator() {
    const { x, y } = this.owner.getController('scale');
    return line<Data<XData>>()
      .defined(defined)
      .curve((this.option as AreaSeriesOption).curveType || curveMonotoneX)
      .x(d => (<ScaleTime<number, number>>x)(d.x as number))
      .y(d => y(d.y) || 0);
  }

  private getAraGenerator() {
    const { x, y } = this.owner.getController('scale');
    return area<Data<XData>>()
      .defined(defined)
      .curve((this.option as AreaSeriesOption).curveType || curveMonotoneX)
      .x(d => (<ScaleTime<number, number>>x)(d.x as number))
      .y0(y.range()[0])
      .y1(d => y(d.y) || 0);
  }
}
