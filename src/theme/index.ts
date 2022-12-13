import { get } from 'lodash';

import { ThemeOptions } from '../index.js';

import { Light } from './light.js';

export { Dark } from './dark.js';
export { Light } from './light.js';

// 所有已经存在的主题
const Themes: Record<string, ThemeOptions> = {
  default: Light(),
};

/**
 * 获取主题配置信息。
 * @param theme 主题名
 */
export function getTheme(theme: string, option?: ThemeOptions): ThemeOptions {
  return Object.assign(get(Themes, theme, Themes.default), option);
}

/**
 * 注册新的主题配置信息。
 * @param name 主题名。
 * @param value 具体的主题配置。
 */
export function registerTheme(name: string, value: ThemeOptions) {
  Themes[name] = value;
}
