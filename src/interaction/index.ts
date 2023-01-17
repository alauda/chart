import { InteractionCtor } from './interaction.js';

const INTERACTIONS: Map<string, InteractionCtor> = new Map();

/**
 * 全局注册组件。
 * @param name 交互名称
 * @param interaction 注册的组件类
 * @returns void
 */
export function registerInteraction(
  name: string,
  interaction: InteractionCtor,
) {
  INTERACTIONS.set(name, interaction);
}

/**
 * 根据交互名获取交互类。
 * @param name 交互名称
 * @returns 返回交互类
 */
export function getInteraction(name: string): InteractionCtor {
  return INTERACTIONS.get(name);
}
