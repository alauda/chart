import { get } from 'lodash-es';

import { View } from '../../chart/view.js';
import { getSeriesPathType } from '../../strategy/utils.js';
import { LineShapeOption, ShapeOptions } from '../../types/options.js';
import { ShapeType } from '../../utils/index.js';

import { Shape } from './index.js';

export type StepType = 'start' | 'end';
/**
 * Line 折线图
 */
export default class Line extends Shape<Line> {
  override type = ShapeType.Line;

  private stepType: StepType;

  map(name: string) {
    this.mapName = name;
    return this;
  }

  step(type: 'start' | 'end') {
    this.stepType = type;
  }

  constructor(ctrl: View, opt: ShapeOptions = {}) {
    super(ctrl, opt);
    this.ctrl.setShape(this.type, this);
    const option: LineShapeOption = get(this.ctrl.getOption(), this.type);
    if (typeof option === 'object' && option.step) {
      this.stepType = option.step;
    }
  }

  getSeries() {
    const baseSeries = this.getBaseSeries();
    return this.getData().map(({ color, name }) => {
      return {
        stroke: color,
        label: name,
        spanGaps: this.connectNulls,
        ...getSeriesPathType(this.type, color, this.option, this.stepType),
        ...this.option,
        ...(baseSeries.points && {
          points: {
            ...baseSeries.points,
            fill: color,
            space: 0,
          },
        }),
      };
    });
  }

  override destroy() {
    this.stepType = null;
    super.destroy();
  }
}
