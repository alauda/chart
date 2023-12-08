import { get, isNumber } from 'lodash';

import { UPlotViewStrategy } from '../strategy/index.js';
import { ScaleOption } from '../types/index.js';

import { BaseComponent } from './base.js';

export class Scale extends BaseComponent<Record<'x' | 'y', ScaleOption>> {
  name = 'scale';

  private get strategy() {
    return this.ctrl.strategyManage.getStrategy('uPlot') as UPlotViewStrategy;
  }

  render() {
    this.option = get(this.ctrl.getOption(), this.name, {});
  }

  update() {
    // ..
    this.option = get(this.ctrl.getOption(), this.name, {});
    const x = get(this.option, 'x');
    const y = get(this.option, 'y');

    x && this.setScale('x', { min: x.min, max: x.max });
    y && this.setScale('y', { min: y.min, max: y.max });
  }

  getOptions() {
    return {
      scales: {
        x: this.getXOptions(),
        y: this.getYOptions(),
      },
    };
  }

  setScale(field: 'x' | 'y', limits: { min?: number; max?: number }) {
    const iUPlot = this.strategy.getUPlotChart();
    const scale = iUPlot.scales[field];
    this.ctrl.setOption([this.name, field], limits);
    iUPlot.setScale(field, {
      min: limits.min || scale.min,
      max: limits.max || scale.max,
    });
  }

  private getXOptions() {
    if (!this.option.x) {
      return {};
    }
    const { max, min } = this.option.x || {};
    const maxV = isNumber(max) ? { max } : {};
    const minV = isNumber(min) ? { min } : {};
    return {
      ...maxV,
      ...minV,
    };
  }

  private getYOptions() {
    const { max, min } = this.option.y || {};
    const notAuto = !isNumber(max) && !isNumber(min);
    return {
      auto: notAuto,
      range: (_u: uPlot, dataMin: number, dataMax: number) => {
        const minV = min
          ? Math.max(dataMin, min || 0)
          : Math.min(dataMin, min || 0);
        const maxV = Math.max(dataMax, max || 1);
        return [minV, maxV > 1 ? maxV + 1 : maxV];
      },
    };
  }
}
