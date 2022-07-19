import { XData } from './options.js';

export interface TooltipContext {
  title: Date | number | string;
  values: TooltipContextItem[];
}
export interface TooltipContextItem extends XData {
  name: string;
  color: string;
  x: string;
  y: number;
  activated?: boolean;
}
