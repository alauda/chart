import { getSeriesPathType } from '../../strategy/utils.js';
import { ShapeType } from '../../utils/index.js';

import { Shape } from './index.js';

/**
 * Area 面积图
 */
export default class Area extends Shape<Area> {
  override type = ShapeType.Area;

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
        ...getSeriesPathType(this.type, color, this.option),
        ...baseSeries,
      };
    });
  }
}
