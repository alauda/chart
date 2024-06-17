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
      ? (u: uPlot, splits: string[], axisIdx: number, tickSpace: number, tickIncr: number) => {
          const params = {u, splits, axisIdx, tickSpace, tickIncr }
          return splits.map(d => {
            return isFunction(yFormatter)
              ? yFormatter(String(d), params)
              : template(yFormatter, { value: d });
          });
        }
      : null;
    const ySize = autoSize === false ? {} : { size: axisAutoSize };
    return {
      values: yValues,
      ...ySize,
      // space: function (self: uPlot, axisIdx: number): number {
      //   const axis = self.axes[axisIdx];
      //   const scale = self.scales[axis.scale!];

      //   // for axis left & right
      //   if (axis.side !== 2 || !scale) {
      //     return 30;
      //   }

      //   const defaultSpacing = 40;

      //   return defaultSpacing;
      // },
      // gap: 5,
      // side: 3,
      // show: true,
      // ticks: {
      //   show: true,
      //   size: 3,
      //   width: 0.5,
      // },
    };
  }
}
