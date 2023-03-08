import { get } from 'lodash';
import uPlot from 'uplot';

// import { LegendItemActive } from '../../index.js';

import { Action } from './action.js';

/**
 * legend toggle
 * @ignore
 */
export class LegendToggle extends Action {
  get name(): string {
    return 'legend';
  }

  get component() {
    return this.view.components.get('legend');
  }

  get uPlot() {
    return get(this.view.strategyManage.getStrategy('uPlot'), 'uPlot') as uPlot;
  }

  /**
   * 切换 legend
   */
  // toggle(value: LegendItemActive) {
  //   if (this.uPlot) {
  //     this.uPlot?.setSeries(value.index + 1, { show: !value.isActive }, true);
  //   }
  // }
  toggle() {
    // TODO
  }
}
