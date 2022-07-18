import { scaleTime, scaleLinear, scalePoint, scaleBand, ScaleBand } from 'd3';

import { ServiceController } from '../abstract';
import View from '../chart/view';
import { DEFAULT_Y_SCALE_MAX, DEFAULT_Y_SCALE_MIN } from '../constant';
import { AxisOption, BarSeriesOption, ScaleType } from '../types';

export class Scale extends ServiceController {
  xOptions: AxisOption;

  yOptions: AxisOption;

  get isGroup() {
    return (this.owner.options.seriesOption as BarSeriesOption)?.isGroup;
  }

  constructor(owner: View) {
    super(owner);
    this.owner = owner;
    this.xOptions = this.owner.options.xAxis || {};
    this.yOptions = this.owner.options.yAxis || {};
  }

  get name() {
    return 'scale';
  }

  get dataValues() {
    return this.owner.chartData.flatMap(item => item.values);
  }

  get xSeriesValue(): Array<Date | number | string> {
    return [...new Set(this.dataValues.map(d => d.x))];
  }

  get xBarSeriesValue() {
    return this.isGroup
      ? this.owner.chartData.map(d => d.name)
      : this.owner.chartData[0].values.map(d => d.x);
  }

  get ySeriesValue(): Array<Date | number | string> {
    const seriesOption = (this.owner.options.seriesOption ||
      {}) as BarSeriesOption;
    if (seriesOption.stack) {
      return this.owner.chartData.reduce<number[]>(
        (pre, cur) => [...pre, cur.values.reduce((acc, d) => acc + d.y, 0)],
        [],
      );
    }
    return this.dataValues.map(d => d.y);
  }

  get scaleType() {
    return this.xOptions.type || getScaleType(this.xSeriesValue);
  }

  get isRotated() {
    return this.owner.isRotated;
  }

  init() {
    // ..
  }

  destroy() {
    // ..
  }

  get xDomain() {
    return this.owner.options.type === 'bar' && this.isGroup
      ? this.owner.chartData.map(d => d.name)
      : getXDomain(this.xSeriesValue, this.scaleType);
  }

  get x() {
    return this.getXScale(this.xDomain);
  }

  get xBarScale() {
    const width = (<ScaleBand<string>>this.x).bandwidth();
    const defaultPadding = 8;
    const barPadding = this.isRotated ? 3 : defaultPadding;
    const spacing = this.dataValues.length / (width / barPadding);
    return scaleBand()
      .range([0, width])
      .paddingInner(spacing)
      .domain(this.xSeriesValue as string[]);
  }

  get yDomain() {
    const defaultDomain = getMaxMinValue(this.ySeriesValue);
    const min = Math.min(
      0,
      this.yOptions.min || DEFAULT_Y_SCALE_MIN,
      defaultDomain[0],
    );
    const max = Math.max(
      0,
      this.yOptions.max || DEFAULT_Y_SCALE_MAX,
      defaultDomain[1],
    );
    return [min, max];
  }

  get y() {
    const { width, height } = this.owner.size.main;
    const h = this.isRotated ? width : height;
    const top = this.owner.headerTotalHeight;
    return scaleLinear()
      .domain(this.yDomain)
      .range(this.isRotated ? [0, h] : [h, top])
      .nice();
  }

  getXScale(domain: Array<Date | any | number>) {
    const { width, height } = this.owner.size.main;
    const w = this.isRotated ? height : width;
    const t = this.isRotated ? this.owner.headerTotalHeight : 0;
    if (this.owner.options.type === 'bar') {
      const dm = this.isGroup ? domain : this.xSeriesValue;
      const scaleB = scaleBand()
        .range([t, w])
        .domain(dm)
        .padding(3 / 10);
      return scaleB.rangeRound([t, w]);
    }
    switch (this.scaleType) {
      case ScaleType.TIME:
        return scaleTime().domain(domain).range([0, w]);
      case ScaleType.LINEAR:
        return scaleLinear().domain(domain).range([0, w]);
      case ScaleType.ORDINAL:
        return scalePoint().domain(domain).range([0, w]);
    }
  }
}

export function getXDomain(
  data: Array<Date | number | string>,
  scaleType: ScaleType,
) {
  if ([ScaleType.TIME, ScaleType.LINEAR].includes(scaleType)) {
    return getMaxMinValue(data);
  }
  return data;
}

function getMaxMinValue(data: Array<Date | number | string>): [number, number] {
  return data.reduce(
    (acc, pre) => {
      const value = +pre || 0;
      return [
        acc[0] < +value ? acc[0] : +value,
        acc[1] > +value ? acc[1] : +value,
      ];
    },
    [+data[0], +data[0]],
  ) as [number, number];
}

export function getScaleType(values: Array<Date | number | string>): ScaleType {
  const allDates = values.every(value => value instanceof Date);
  if (allDates) {
    return ScaleType.TIME;
  }
  const allNumbers = values.every(value => typeof value === 'number');
  if (allNumbers) {
    return ScaleType.LINEAR;
  }
  return ScaleType.ORDINAL;
}
