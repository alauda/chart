import { NumberValue, Selection } from 'd3';

import { ChartData, Options } from '../types/index.js';

export type D3EelSelection = Selection<HTMLElement, unknown, null, undefined>;

export type D3SvgSSelection = Selection<
  SVGSVGElement,
  unknown,
  null,
  undefined
>;

export type D3SvgGSelection = Selection<SVGGElement, unknown, null, undefined>;

export type D3Selection = Selection<any, any, any, any>;

export type D3ChartSelection = Selection<any, ChartData, any, any>;

export type XScaleValue = string & (NumberValue & (Date | NumberValue));

export interface ChartEle {
  chart: D3EelSelection;
  header: D3EelSelection;
  svg: D3SvgSSelection;
  main: D3SvgGSelection;
  title?: D3SvgGSelection;
  legend?: D3Selection;
  tooltip?: D3Selection;
}

export interface ChartSize {
  width: number;
  height: number;
}

export interface ViewProps {
  ele: D3EelSelection;
  svg: D3SvgSSelection;
  header: D3EelSelection;
  size: ChartSize;
  options: Options;
}

export type Theme = 'light' | 'dark' | 'system';
