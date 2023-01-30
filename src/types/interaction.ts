import { Action } from '../interaction/action/action.js';

import { ChartEvent as TriggerType } from './chart.js';

export interface InteractionSteps {
  /**
   * 交互开始
   */
  start?: InteractionStep[];

  /**
   * 交互结束
   */
  end?: InteractionStep[];
}

export interface ActionObject {
  action: Action;
  methodName: string;
}

export interface InteractionStep {
  /**
   * 触发事件，支持 view，chart 的各种事件
   */
  trigger: string | TriggerType;

  /**
   * @private
   * 存储 action callback
   */
  actionObject?: ActionObject;

  /**
   * action 名称 (组件:动作)
   */
  action: string | ActionType;

  // TODO: throttle debounce once
}
// TODO: 同时支持 string, string[], ()=>{} 三种方法是
// export type StepAction = string | string[] | ActionType | ActionType[];

// 交互 触发类型 [区域:动作]

// 交互 动作类型  [组件:动作]
export enum ActionType {
  // tooltip
  TOOLTIP_SHOW = 'tooltip:show',
  TOOLTIP_HIDE = 'tooltip:hide',

  // element
  ELEMENT_ACTIVE = 'element-active:active',
  ELEMENT_RESET = 'element-active:reset',

  // legend
  LEGEND_TOGGLE = 'legend:toggle',
}
