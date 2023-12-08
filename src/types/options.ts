import uPlot, { Padding as UPadding } from 'uplot';

import { AdjustOption } from '../components/shape/bar.js';
import { SizeCallback } from '../components/shape/point.js';

import { TooltipValue } from './component.js';

import { Theme } from './index.js';

// eslint-disable-next-line no-restricted-syntax
export type Padding = UPadding;

export interface ChartOption {
  container: string | HTMLElement;
  data?: Data;
  autoFit?: boolean; // true
  // 图表宽高度 不设置默认根据父容器高度自适应
  width?: number;
  height?: number;
  // 图表内边距 上 右 下 左  不包含 header
  padding?: Padding; // [16,0,0,0]
  // 默认交互 ['tooltip', 'legend-filter', 'legend-active']
  defaultInteractions?: string[];
  // 图表组件等相关的配置。同时支持配置式 和 声明式
  options?: Options;
  /** 主题 */
  theme?: Theme; // default system
}

export interface ViewOption {
  readonly ele: HTMLElement;
  readonly chartEle: HTMLElement;
  readonly chartOption: ChartOption;
  width?: number;
  height?: number;
  padding?: Padding;
  data?: Data;
  options?: Options;
  defaultInteractions: string[];
  /** 主题 */
  theme?: Theme; // default system
}

export interface Options {
  readonly padding?: Padding;
  readonly data?: Data;

  title?: TitleOption;
  legend?: LegendOption;
  tooltip?: TooltipOption;
  annotation?: AnnotationOption;
  scale?: {
    x?: ScaleOption;
    y?: ScaleOption;
  };
  axis?: {
    x?: AxisOption;
    y?: AxisOption;
  };
  coordinate?: CoordinateOption;
  line?: LineShapeOption;
  area?: AreaShapeOption;
  bar?: BarShapeOption;
  point?: PointShapeOption;
  gauge?: GaugeShapeOption;
}

export type Data = DataItem[];

export interface DataItem {
  name: string;
  color?: string;
  value?: number;
  // type-coverage:ignore-next-line
  values?: Array<{ x: any; y: number; size?: number }>;
}

export type TitleOption = TitleOpt | false;
export interface TitleOpt {
  custom?: boolean;
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
  custom?: boolean;
  position?: LegendPosition;
}

export interface ScaleOption {
  time?: boolean; // true
  min?: number;
  max?: number;
}

export type CoordinateOption = CoordinateOpt | boolean;

export interface CoordinateOpt {
  transposed?: boolean;
}

export type AxisOption = AxisOpt | boolean;
export interface AxisOpt {
  autoSize?: boolean; // 默认 true
  formatter?: string | ((value: string | number) => string);
}

export type TooltipOption = TooltipOpt | boolean;
export interface TooltipOpt {
  showTitle?: boolean;
  popupContainer?: HTMLElement; // tooltip 渲染父节点 默认 body
  titleFormatter?: string | ((title: string, values: TooltipValue[]) => string);
  nameFormatter?: string | ((name: string) => string);
  valueFormatter?: string | ((value: number) => string);
  itemFormatter?: (value: TooltipValue[]) => string | TooltipValue[] | Element;
  sort?: (a: TooltipValue, b: TooltipValue) => number;
}

export interface ShapeOption {
  name?: string; // 指定 data name
  connectNulls?: boolean; // 是否链接空值 默认 false
  points?: Omit<uPlot.Series.Points, 'show'> | boolean; // 默认 false
  width?: number; // 线宽
  alpha?: number;
  map?: string;
}

export interface LineShapeOption extends ShapeOption {
  step?: 'start' | 'end';
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AreaShapeOption extends ShapeOption {}

export interface BarShapeOption extends ShapeOption {
  adjust?: AdjustOption;
}

export interface PointShapeOption extends ShapeOption {
  pointSize?: number;
  sizeField?: string;
  sizeCallback?: SizeCallback;
}

export interface PieShapeOption {
  innerRadius?: number; // 内半径 0 - 1
  outerRadius?: number; // 外半径
  startAngle?: number; // 开始角度
  endAngle?: number; // 结束角度
  label?: {
    text?: string | ((value: number, total?: number) => string);
    description?: string | ((data: Data) => string);
    position?: {
      x?: number;
      y?: number;
    };
  };
  total?: number; // 指定总量
  backgroundColor?: string;
  itemStyle?: {
    borderRadius?: number; //  item 圆角
    borderWidth?: number; // item间隔宽度
  };
  innerDisc?: boolean; // 内阴影盘
}

export interface GaugeShapeOption {
  innerRadius?: number; // 内半径 0 - 1
  outerRadius?: number; // 外半径
  max?: number; // 100
  colors?: Array<[number, string]>; // 指定颜色 [数值, color]
  label?: {
    text?: string | ((data: Data, total?: number) => string);
    description?: string | ((data: Data) => string);
    position?: {
      x?: number;
      y?: number;
    };
  };
  text?: {
    show?: boolean; // true,
    size?: number; // 12
    color?: string | ((value: number) => string); // n-4
  };
}

export type ShapeOptions =
  | LineShapeOption
  | AreaShapeOption
  | BarShapeOption
  | PointShapeOption;

export interface AnnotationOption {
  lineX?: AnnotationLineOption;
  lineY?: AnnotationLineOption[];
}

export interface AnnotationLineOption {
  data: string | number;
  text?: {
    position?: 'left' | 'right' | string; //
    content: unknown;
    style?: object;
    border?: {
      style?: string;
      padding?: [number, number];
    };
  };
  style?: {
    stroke?: string;
    width?: number;
    lineDash?: [number, number];
  };
}
