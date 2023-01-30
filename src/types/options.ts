import uPlot from 'uplot';

import { AdjustOption } from '../components/shape/bar.js';
import { SizeCallback } from '../components/shape/point.js';

import { TooltipValue } from './component.js';

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
  defaultInteractions: string[];
  /** 主题 */
  theme?: Theme; // default system
}

export interface Options {
  data?: Data;
  title?: TitleOption;
  legend?: LegendOption;
  tooltip?: TooltipOption;
  axis?: Record<'x' | 'y', AxisOption>;
  line?: LineShapeOption;
  area?: AreaShapeOption;
  bar?: BarShapeOption;
  point?: PointShapeOption;
}

export type Data = DataItem[];

export interface DataItem {
  name: string;
  color?: string;
  // type-coverage:ignore-next-line
  values: Array<{ x: any; y: number; size?: number }>;
}

export type TitleOption = TitleOpt | boolean;
export interface TitleOpt {
  text?: string;
  formatter?: string | ((text: string) => string);
}

export type LegendOption = LegendOpt | boolean;

export type LegendPosition =
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right';

export interface LegendOpt {
  position: LegendPosition;
}

export type CoordinateOption = CoordinateOpt | boolean;

export interface CoordinateOpt {
  transposed?: boolean;
}

export type AxisOption = AxisOpt | boolean;
export interface AxisOpt {
  autoSize?: boolean; // 默认 true
  min?: number;
  max?: number;
}

export type TooltipOption = TooltipOpt | boolean;
export interface TooltipOpt {
  showTitle?: boolean;
  titleFormatter?: string | ((title: string) => string);
  valueFormatter?: string | ((value: TooltipValue) => string);
}

export interface ShapeOption {
  name?: string; // 指定 data name
  color?: string;
  connectNulls?: boolean; // 是否链接空值 默认 false
  points?: Omit<uPlot.Series.Points, 'show'> | boolean; // 默认 false
  width?: number;
  alpha?: number;
  map?: string;
}

export interface LineShapeOption extends ShapeOption {
  step?: 'start' | 'end';
}

export interface AreaShapeOption extends ShapeOption {
  map?: string;
}

export interface BarShapeOption extends ShapeOption {
  adjustOpt?: AdjustOption;
}

export interface PointShapeOption extends ShapeOption {
  pointSize?: number;
  sizeField?: string;
  sizeCallback?: SizeCallback;
}

export type ShapeOptions =
  | LineShapeOption
  | AreaShapeOption
  | BarShapeOption
  | PointShapeOption;

export interface AnnotationOption {
  text?: string;
}
