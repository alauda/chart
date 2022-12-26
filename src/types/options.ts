import { Theme } from './index.js';

export interface ChartOption {
  container: string | HTMLElement;
  data?: Data;
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
  width?: number;
  height?: number;
  padding?: number[];
  data?: Data;
  options?: Options;
  /** 主题 */
  theme?: Theme; // default system
}

export interface Options {
  data?: Data;
  title?: TitleOption;
}

export type Data = DataItem[];

export interface DataItem {
  name: string;
  color?: string;
  values: Array<{ x: any; y: number }>;
}

export type TitleOption = TitleOpt | boolean;
export interface TitleOpt {
  text?: string;
  formatter?: string | ((text: string) => string);
}

export type LegendOption = LegendOpt | boolean;
export interface LegendOpt {
  position: 'left' | 'right' | 'top' | 'bottom';
}

export type AxisOption = AxisOpt | boolean;
export interface AxisOpt {
  min?: number;
  max?: number;
}

export type TooltipOption = TooltipOpt | boolean;
export interface TooltipOpt {
  showTitle?: boolean;
}

export interface ShapeOption {
  width?: number;
}

export interface AnnotationOption {
  text?: string;
}
