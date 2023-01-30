import { Action } from './action.js';

/**
 * Tooltip 显示隐藏的 Action
 * @ignore
 */
export class TooltipAction extends Action {
  get name(): string {
    return 'tooltip';
  }

  get component() {
    return this.view.components.get('tooltip');
  }

  /**
   * 显示 Tooltip
   */
  show() {
    this.component.container.style.visibility = 'visible';
  }

  /**
   * 隐藏 Tooltip
   */
  hide() {
    this.component.container.style.visibility = 'hidden';
  }
}
