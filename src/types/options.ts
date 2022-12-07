import { Theme } from './index.js';

export interface ChartOption {
  container: string | HTMLElement;
  // 图表宽高度 不设置默认根据父容器高度自适应
  width?: number;
  height?: number;
  // 图表内边距 上 右 下 左
  padding?: number[];
  // 默认交互 ['tooltip', 'legend-filter', 'legend-active']
  defaultInteractions?: string[];
  // 图表组件等相关的配置。同时支持配置式 和 声明式
  options?: Options;
  /** 主题 */
  theme?: Theme; // default system
}

export interface ViewOption {
  readonly ele: HTMLElement;
  options?: Options;
}

export interface Options {
  title?: TitleOption;
}

export interface TitleOption {
  text?: string;
  formatter?: string | ((text: string) => string);
}
