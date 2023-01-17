import { get } from 'lodash';

import { AxisOpt } from '../types/index.js';

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
      axes: [
        {},
        {
          size:
            typeof this.option === 'object' && this.option.y?.autoSize === false
              ? null
              : axisAutoSize,
        },
      ],
    };
  }
}
