import { get, isFunction } from 'lodash';

import { AXES_X_VALUES } from '../strategy/config.js';
import { AxisOpt } from '../types/index.js';
import { template } from '../utils/index.js';

import { BaseComponent } from './base.js';
import { axisAutoSize } from './uplot-lib/index.js';

export class Axis extends BaseComponent<Record<'x' | 'y', AxisOpt>> {
  name = 'axis';

  render() {
    // ..
    const opt = this.ctrl.getOption();
    this.option = get(opt, this.name, {});
  }

  update() {
    // ..
  }

  getOptions() {
    return {
      axes: [this.getXOptions(), this.getYOptions()],
    };
  }

  private getXOptions() {
    const { formatter: xFormatter } = this.option.x || {};
    const xValues = xFormatter
      ? (_u: uPlot, splits: string[]) =>
          splits.map(d => {
            return isFunction(xFormatter)
              ? xFormatter(String(d))
              : template(xFormatter, { value: d });
          })
      : AXES_X_VALUES;
    return {
      values: xValues,
    };
  }

  private getYOptions() {
    const { autoSize, formatter: yFormatter } = this.option.y || {};
    const yValues = yFormatter
      ? (_u: uPlot, splits: string[]) =>
          splits.map(d => {
            return isFunction(yFormatter)
              ? yFormatter(String(d))
              : template(yFormatter, { value: d });
          })
      : null;
    const ySize = autoSize === false ? {} : { size: axisAutoSize };
    return {
      values: yValues,
      ...ySize,
    };
  }
}
