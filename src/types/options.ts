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
  inactivatedSet?: Set<string>;
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

  manualResetColor?: boolean;
}

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Uint8ClampedArray
  | Float32Array
  | Float64Array;

export interface DataValue {
  x: any;
  y: number;
  size?: number;
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

  manualResetColor?: boolean;
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
  barStacked?: BarStackedShapeOption;
  pie?: PieShapeOption;
}

export type Data = DataItem[];

export interface DataItem {
  name: string;
  id?: string;
  color?: string;
  value?: number;
  stack?: string;
  // type-coverage:ignore-next-line
  values?: DataValue[];
  floatValues?: TypedArray[];
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
  show?: boolean;
  categories?: string[];
  autoSize?: boolean; // 默认 true
  formatter?:
    | string
    | ((value: string | number, uPlotParams?: unknown) => string);
}

export type TooltipOption = TooltipOpt | boolean;
export interface TooltipOpt {
  mode?: 'single' | 'all'; // 坐标系默认 single， pie 支持 all
  showTitle?: boolean;
  popupContainer?: HTMLElement; // tooltip 渲染父节点 默认 body
  titleFormatter?: string | ((title: string, values: TooltipValue[]) => string);
  nameFormatter?: string | ((name: string, data?: TooltipValue) => string);
  valueFormatter?: string | ((value: number, data?: TooltipValue) => string);
  itemFormatter?: (value: TooltipValue[]) => string | TooltipValue[] | Element;
  sort?: (a: TooltipValue, b: TooltipValue) => number;
}

export interface ShapeOption extends uPlot.Series {
  name?: string; // 指定 data name
  connectNulls?: boolean; // 是否链接空值 默认 false
  // points?: Omit<uPlot.Series.Points, 'show'> | boolean; // 默认 false
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
  barWidth?: number;
  bandWidth?: number;
  itemStyle?: {
    borderRadius?: number;
  };
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
  padAngle?: number;
  label?: {
    text?: string | ((value: number, total?: number) => string);
    description?: string | ((data: Data) => string);
    position?: {
      x?: number;
      y?: number;
    };
  };
  labelLine?: {
    labels?: Array<'name' | 'value' | 'percent'>;
    show?: boolean;
    formatter?: string | ((data: unknown, percent: number) => string);
  };
  total?: number; // 指定总量
  backgroundColor?: string;
  backgroundArc?: boolean; // 背景圆弧
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
    textStyle?: {
      color?: string;
    };
    descriptionStyle?: {
      color?: string;
    };
  };
  text?: {
    show?: boolean; // true,
    size?: number; // 12
    color?: string | ((value: number) => string); // n-4
  };
}

export interface BarStackedShapeOption extends ShapeOption {
  barWidth?: number;
  itemStyle?: {
    borderRadius?: number;
  };
}

export type ShapeOptions =
  | LineShapeOption
  | AreaShapeOption
  | BarShapeOption
  | PointShapeOption;

export interface AnnotationOption {
  lineX?: AnnotationLineOption;
  areaX?: AnnotationLineOption;
  lineY?: AnnotationLineOption[];
  areaY?: AnnotationLineOption[];
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
    line?: boolean;
    stroke?: string;
    width?: number;
    lineDash?: [number, number];
  };
}
