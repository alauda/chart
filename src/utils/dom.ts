import { select } from 'd3';
import { debounce } from 'lodash';

import { Size } from '../index.js';

function getElementSize(ele: Element | HTMLElement) {
  return {
    width: ele.clientWidth,
    height: ele.clientHeight,
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
