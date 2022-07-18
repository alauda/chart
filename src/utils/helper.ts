import { isNumber } from 'lodash';

import View from '../chart/view';
import { Percentage } from '../types';

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
  return Math.floor((xPos * count) / w);
}

export function isPercentage(num: number | string): num is Percentage {
  return !isNumber(num) && num.endsWith('%');
}

export function removeSymbol(str: string) {
  return str?.replace(/\W+/gi, '') || str;
}

export function isHtml(str: string) {
  return /<\/?[a-z][\s\S]*>/i.test(str);
}

export function abs(value: number) {
  return Math.abs(value);
}
