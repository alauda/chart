import { Tooltip } from '../../components/index.js';
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
    return this.view.components.get('tooltip') as Tooltip;
  }

  /**
   * 显示 Tooltip
   */
  show() {
    // this.component.showTooltip()
  }

  /**
   * 隐藏 Tooltip
   */
  hide() {
    // this.component.hideTooltip();
  }
}
