import { View } from '../../chart/view.js';
import { ShapeOptions } from '../../types/index.js';

export type ShapeCtor = new (view: View, opt: unknown) => Shape | PolarShape;

export abstract class Shape<T = unknown> {
  readonly type: string;

  protected option: ShapeOptions;

  /** 是否连接空值 */
  connectNulls = false;

  /** 颜色 */
  // public color: boolean;

  // 映射值
  mapName: string;

  ctrl: View;

  abstract map(name: string): T;

  abstract getSeries(): any;

  constructor(ctrl: View, opt: ShapeOptions = {}) {
    this.ctrl = ctrl;
    const { connectNulls = false } = opt;
    this.connectNulls = connectNulls;
    // this.color = color;
    this.option = opt;
  }

  getData() {
    const data = this.ctrl.getData();
    const values = this.mapName
      ? data.filter(d => d.name === this.mapName)
      : data;
    return values.length ? values : data;
  }

  getBaseSeries() {
    const { points } = this.option;
    return {
      spanGaps: this.connectNulls,
      points: points
        ? { show: true, ...(points as uPlot.Series.Points) }
        : { show: false },
    };
  }

  getOptions() {
    return {};
  }
  // map(name: string) {
  //   this.mapName = name;
  //   console.log(this.type, this.option, this.mapName, this);
  // }
}

export abstract class PolarShape<T = unknown> {
  readonly type: string;

  protected option: T;

  ctrl: View;

  container: d3.Selection<SVGGElement, unknown, null, undefined>;

  abstract init(): void;

  abstract render(): void;


  constructor(ctrl: View, opt = {}) {
    this.ctrl = ctrl;
    this.option = opt as T;
  }

  getData() {
    const data = this.ctrl.getData();
    return data;
  }

  destroy() {
    this.container?.remove();
  }
}
