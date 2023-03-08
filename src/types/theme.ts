export type Theme = LightTheme | DarkTheme | CustomTheme | SystemTheme;

/************************************************
 *                    待确定                     *
 ************************************************/
interface Legend {
  width?: number;
  stroke?: string;
  fill?: string;
}

interface Title {
  width?: number;
  stroke?: string;
  fill?: string;
}

/***********************************************************/
interface Axis {
  stroke?: string; // 轴值颜色
  font?: string; // 轴值字体
  tickWidth?: number; // 刻度宽
  tickStroke?: string; // 刻度颜色
  gridWidth?: number; // 网格宽度
  gridStroke?: string; // 网格颜色
}

interface Shape {
  stroke?: string; // 颜色
  width?: string; // 宽度
  fill?: string; // 填充色
  point?: Point;
}

interface Point {
  size?: number; // 直径
}

export interface ThemeOptions {
  colorVar: Record<string, string>
  backgroundColor?: string;

  // 标题
  title?: Title;
  // 图例
  legend?: Legend;

  // 坐标
  axis?: Axis;
  xAxis?: Axis;
  yAxis?: Axis;

  // 图形
  shape?: Shape;
}

export type LightTheme = {
  type?: 'light';
} & ThemeOptions;

export type DarkTheme = {
  type?: 'dark';
} & ThemeOptions;

export type CustomTheme = {
  type?: string;
} & ThemeOptions;

export type SystemTheme = {
  type?: 'system';
} & ThemeOptions;
