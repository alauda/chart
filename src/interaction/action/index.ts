import { View } from '../../chart/view.js';

import { Action } from './action.js';

// type-coverage:ignore-next-line
type ActionCtr = new (view: View, opt?: any) => Action;

const ACTIONS: Map<string, ActionCtr> = new Map();

/**
 * 全局注册 action。
 * @param name action 名称
 * @param action action 实例
 * @returns void
 */
export function registerAction(name: string, action: ActionCtr) {
  ACTIONS.set(name, action);
}

/**
 * 获取动作类
 * @param name action 名称
 * @returns 返回动作类
 */
export function getAction(name: string): ActionCtr {
  return ACTIONS.get(name);
}
