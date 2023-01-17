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
    const { width, alpha } = this.option;
    const defaultOpt = {
      width: width ?? 1.5,
      alpha: alpha ?? 1,
    };
    return this.getData().map(({ color, name }) => {
      return {
        ...defaultOpt,
        stroke: color,
        label: name,
        ...getSeriesPathType(this.type, color),
        ...baseSeries,
      };
    });
  }
}
