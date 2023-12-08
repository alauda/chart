import Pie from '../../components/shape/pie.js';
import { Action } from './action.js';

/**
 * 元素激活
 */
export class ElementAction extends Action {
  get name(): string {
    return 'element';
  }

  get pieCtrl() {
    return this.view.shapeComponents.get('pie') as Pie;
  }
  /**
   * 激活
   */
  active(context: any) {
    this.pieCtrl?.onMousemove(context);
  }

  /**
   * 重制
   */
  reset(context: any) {
    this.pieCtrl?.onMouseleave(context);
  }
}
