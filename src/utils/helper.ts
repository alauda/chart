import { isNumber } from 'lodash';

import { View } from '../chart/index.js';
import { CLASS_NAME } from '../constant.js';
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

export function getBarsOffsets(owner: View) {
  const containerEl =
    typeof owner.options.container === 'string'
      ? document.querySelector(owner.options.container)
      : owner.options.container;

  return owner.isGroup
    ? Array.from(
        containerEl.querySelectorAll(`.${CLASS_NAME.bars} .${CLASS_NAME.bar}`),
      ).map(el => getElTransFormPosition(el))
    : Array.from(
        containerEl.querySelectorAll(
          `.${CLASS_NAME.bars} .${CLASS_NAME.barItem}`,
        ),
      ).map(el => {
        const barWidth = parseFloat(el.getAttribute('width'));
        return [el.getAttribute('x'), el.getAttribute('y')]
          .map(parseFloat)
          .map(pos => pos + barWidth / 2);
      });
}

export function findClosestPointIndex(
  xPos: number,
  owner: View,
  isRotated: boolean,
) {
  if (owner.isBar) {
    const offsets = getBarsOffsets(owner)
      .map(pos => pos[isRotated ? 1 : 0])
      .map(offset =>
        // Rotate 时， 标题会影响垂直轴上的 offset
        isRotated && !owner.options.title.hide && owner.options.title.text
          ? offset - owner.basics.main.top
          : offset,
      );

    return offsets.reduce(
      (prev, curr, index) =>
        Math.abs(xPos - curr) < Math.abs(xPos - offsets[prev]) ? index : prev,
      0,
    );
  }

  // 数组可能出现长度不一致情况
  const count = owner.chartData.reduce(
    (prev, curr) => (prev > curr.values.length ? prev : curr.values.length),
    0,
  );
  const w = isRotated ? owner.size.grid.height : owner.size.grid.width;
  return Math.min(Math.max(0, Math.round((xPos * count) / w)), count - 1);
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

export function getElTransFormPosition(el: Element) {
  return (
    el
      .getAttribute('transform')
      .match(/translate\(([\d.-]+),\s*([\d.-]+)\)/)
      ?.map(parseFloat)
      .filter(v => !isNaN(v)) || [0, 0]
  );
}
