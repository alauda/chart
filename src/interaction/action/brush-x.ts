import { get } from 'lodash';
import uPlot from 'uplot';

import { Action } from './action.js';

/**
 * legend toggle
 * @ignore
 */
export class BrushXAction extends Action {
  get name(): string {
    return 'brush-X';
  }


  get uPlot() {
    return get(this.view.strategyManage.getStrategy('uPlot'), 'uPlot') as uPlot;
  }


  start() {
   
  }

  end () {

  }
}
