import { InteractionSteps } from '../types/index.js';

const INTERACTIONS: Map<string, InteractionSteps> = new Map();

/**
 * 全局注册组件。
 * @param name 交互名称
 * @param interaction 注册的组件类
 * @returns void
 */
export function registerInteraction(
  name: string,
  interaction: InteractionSteps,
) {
  INTERACTIONS.set(name, interaction);
}

/**
 * 根据交互名获取交互类。
 * @param name 交互名称
 * @returns 返回交互类
 */
export function getInteraction(name: string): InteractionSteps {
  return INTERACTIONS.get(name);
}
