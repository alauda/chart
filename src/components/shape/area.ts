import { omit } from 'lodash';
import { View } from '../../chart/view.js';
import { getSeriesPathType } from '../../strategy/utils.js';
import { ShapeOptions } from '../../types/options.js';
import { ShapeType } from '../../utils/index.js';

import { Shape } from './index.js';

/**
 * Area 面积图
 */
export default class Area extends Shape<Area> {
  override type = ShapeType.Area;

  constructor(ctrl: View, opt: ShapeOptions = {}) {
    super(ctrl, opt);
    this.ctrl.setShape(this.type, this);
  }

  map(name: string) {
    this.mapName = name;
    return this;
  }

  getSeries() {
    const baseSeries = this.getBaseSeries();
    return this.getData().map(({ color, name }) => {
      return {
        stroke: color,
        label: name,
        ...(omit(this.option, 'alpha')),
        ...getSeriesPathType(this.type, color, this.option),
        ...baseSeries,
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
}
