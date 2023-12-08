import { get } from 'lodash';

import { View } from '../../chart/view.js';
import { UPlotViewStrategy } from '../../strategy/index.js';
import { getSeriesPathType } from '../../strategy/utils.js';
import { BarShapeOption, ShapeOptions } from '../../types/options.js';
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

  private get transposed() {
    return this.ctrl.getCoordinate().isTransposed;
  }

  private adjustOption: AdjustOption = {
    type: 'group',
    marginRatio: 0.2,
  };

  private get strategy() {
    return this.ctrl.strategyManage.getStrategy('uPlot') as UPlotViewStrategy;
  }

  constructor(ctrl: View, opt: ShapeOptions = {}) {
    super(ctrl, opt);
    const option: BarShapeOption = get(this.ctrl.getOption(), this.type);
    if (typeof option === 'object') {
      this.option = option;
      this.adjustOption = {
        ...this.adjustOption,
        ...option.adjust,
      };
    }
  }

  map(name: string): this {
    this.mapName = name;
    return this;
  }

  adjust(adjustOpt: AdjustType | AdjustOption) {
    if (typeof adjustOpt === 'string') {
      this.adjustOption.type = adjustOpt;
    }
    if (typeof adjustOpt === 'object') {
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
        ...getSeriesPathType(this.type, color, this.option),
      };
    });
  }

  override getOptions() {
    const data = this.strategy.getData();
    const isStack = this.adjustOption.type === 'stack';
    const stackOpt = isStack ? stack(data) : {};
    return {
      ...stackOpt,
      plugins: [
        seriesBarsPlugin({
          time: !!get(this.ctrl.getOption()?.scale?.x, 'time'),
          ori: this.transposed ? 1 : 0,
          dir: this.transposed ? -1 : 1,
          stacked: isStack,
          marginRatio: this.adjustOption.marginRatio / 10,
        }),
      ],
    };
  }
}
