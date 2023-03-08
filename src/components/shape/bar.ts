import { get } from 'lodash';
import { UPlotViewStrategy } from '../../strategy/index.js';
import { getSeriesPathType } from '../../strategy/utils.js';
import { ShapeType } from '../../utils/index.js';
import { seriesBarsPlugin, stack } from '../uplot-lib/index.js';

import { Shape } from './index.js';

export type AdjustType = 'stack' | 'group';
export interface AdjustOption {
  type?: AdjustType; // 默认 group
  marginRatio?: number; // type group 下有效 0-1 范围 默认 0.1
}

/**
 * Bar 柱状图
 */
export default class Bar extends Shape<Bar> {
  override type = ShapeType.Bar;

  adjustType: AdjustType = 'group';

  private get transposed() {
    return this.ctrl.getCoordinate().isTransposed;
  }

  private adjustOption: AdjustOption = {
    type: this.adjustType,
    marginRatio: 0.2,
  };

  private get strategy() {
    return this.ctrl.strategyManage.getStrategy('uPlot') as UPlotViewStrategy;
  }

  private get isStack() {
    return this.adjustType === 'stack';
  }

  map(name: string) {
    this.mapName = name;
    return this;
  }

  adjust(adjustOpt: AdjustType | AdjustOption) {
    if (typeof adjustOpt === 'string') {
      this.adjustType = adjustOpt;
    }
    if (typeof adjustOpt === 'object') {
      const { type = 'group' } = adjustOpt || {};
      this.adjustType = type;
      this.adjustOption = adjustOpt;
    }
  }

  getSeries() {
    return this.getData().map(({ color, name }) => {
      return {
        stroke: color,
        label: name,
        points: {
          show: false,
        },
        ...getSeriesPathType(this.type, color),
      };
    });
  }

  override getOptions() {
    const data = this.strategy.getData();
    const stackOpt = this.isStack ? stack(data) : {};
    return {
      ...stackOpt,
      plugins: [
        seriesBarsPlugin({
          time: !!get(this.ctrl.getOption()?.scale?.x, 'time'),
          ori: this.transposed ? 1 : 0,
          dir: this.transposed ? -1 : 1,
          stacked: this.isStack,
          marginRatio: this.adjustOption.marginRatio / 10,
        }),
      ],
    };
  }
}
