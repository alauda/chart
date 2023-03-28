import { select } from 'd3';
import { debounce } from 'lodash';

import { Size } from '../index.js';

export function getElementSize(ele: Element | HTMLElement): Size {
  const style = getComputedStyle(ele);

  return {
    width:
      (ele.clientWidth || parseInt(style.width, 10)) -
      parseInt(style.paddingLeft, 10) -
      parseInt(style.paddingRight, 10),
    height:
      (ele.clientHeight || parseInt(style.height, 10)) -
      parseInt(style.paddingTop, 10) -
      parseInt(style.paddingBottom, 10),
  };
}

export function getChartSize(
  ele: Element | HTMLElement,
  width = 0,
  height = 0,
) {
  let w = width || 0;
  let h = height || 0;
  if (!w && !h && ele) {
    const size = getElementSize(ele);

    w = size.width || w;
    h = size.height || h;
  }
  return {
    width: w,
    height: h,
  };
}

export function getElement(container: HTMLElement | string): HTMLElement {
  return typeof container === 'string'
    ? document.querySelector(container)
    : container;
}

export function transformD3El(dom: HTMLElement) {
  return select(dom);
}

export function getPixel(value: string | number) {
  return typeof +value === 'number' && !isNaN(+value) ? `${value}px` : value;
}

export function resizeObserver(
  el: HTMLElement,
  fn: (size: Size) => void,
): ResizeObserver {
  const resizeObserver = new ResizeObserver(
    debounce(([entry]: ResizeObserverEntry[]) => {
      const { width, height } = entry.contentRect;
      if (width !== 0 || height !== 0) {
        const size = { width, height };
        fn(size);
      }
    }, 200),
  );
  resizeObserver.observe(el);
  return resizeObserver;
}


export function createSvg(el: d3.Selection<HTMLElement, unknown, null, undefined>) {
  return el
    .append('svg')
    .style('width', '100%')
    .style('height', '100%')
    .style('overflow', 'hidden')
    .style('display', 'inline-block');
}
