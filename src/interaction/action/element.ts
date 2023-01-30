import { Action } from './action.js';

/**
 * Tooltip 显示隐藏的 Action
 * @ignore
 */
export class ElementAction extends Action {
  get name(): string {
    return 'element';
  }

  /**
   * 激活
   */
  active() {
    console.log('active');
  }

  /**
   * 重制
   */
  reset() {
    console.log('reset');
  }
}
