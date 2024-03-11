import { isNumber } from 'lodash';

import { View } from '../chart/index.js';
import { Percentage } from '../types/index.js';

export function getPos(
  e: MouseEvent,
  isRotated: boolean,
  rectDom?: HTMLElement,
) {
  const svgE = e.target as SVGRectElement;
  const { scrollLeft, scrollTop } = document.documentElement;
  return isRotated
    ? e.pageY - ((rectDom || svgE).getBoundingClientRect().top + scrollTop)
    : e.pageX - ((rectDom || svgE).getBoundingClientRect().left + scrollLeft);
}

export function findClosestPointIndex(
  xPos: number,
  owner: View,
  isRotated: boolean,
) {
  // 数组可能出现长度不一致情况
  const max = owner.chartData.reduce(
    (prev, curr) => (prev > curr.values.length ? prev : curr.values.length),
    0,
  );
  const count = owner.isBar && owner.isGroup ? owner.chartData.length : max;
  const w = isRotated ? owner.size.grid.height : owner.size.grid.width;
  const idx = Math.round((xPos * count) / w);
  return Math.min(Math.max(0, idx), count - 1);
}

export function isPercentage(num: number | string): num is Percentage {
  return !isNumber(num) && num.endsWith('%');
}

export function removeSymbol(str: string) {
  return str?.replace(/\W+/g, '') || str;
}

export function isHtml(str: string) {
  // eslint-disable-next-line regexp/match-any
  return /<\/?[a-z][\S\s]*>/i.test(str);
}

export function abs(value: number) {
  return Math.abs(value);
}
