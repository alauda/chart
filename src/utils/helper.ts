import { isNumber } from 'lodash';

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
