import { template as _template } from 'lodash';

import { DEFAULT_COLORS } from '../constant';
import { Data, XData } from '../types';

export function getChartColor(index: number) {
  const colorIndex = index % DEFAULT_COLORS.length;
  return DEFAULT_COLORS[colorIndex];
}

/**
 * Generates a short id.
 * http://stackoverflow.com/questions/6248666/how-to-generate-short-uid-like-ax4j9z-in-js
 */
const X = 36;
const Y = 10;
export function generateUID(): string {
  const newId = (
    '0000' + Math.trunc(Math.random() * Math.pow(X, Y)).toString(X)
  ).slice(-Y);
  // append a 'a' because neo gets mad
  return `a${newId}`;
}

const NULL_TYPE: Set<unknown> = new Set([null, undefined]);

export function defined(d: Data<XData>) {
  return !(NULL_TYPE.has(d.x) || NULL_TYPE.has(d.y));
}

const TEMPLATE_OPTIONS = {
  interpolate: /{([\S\s]+?)}/g,
};

export function template(str: string, data: object) {
  return _template(str, TEMPLATE_OPTIONS)(data);
}

export const resizeOn = <T extends Element>(
  target: T,
  fn: (entry: ResizeObserverEntry) => void,
  options?: ResizeObserverOptions,
) => {
  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      fn(entry);
    }
  });
  resizeObserver.observe(target, options);
  return () => {
    resizeObserver.unobserve(target);
    resizeObserver.disconnect();
  };
};

export function getTextWidth(text: string | number, font = '12px arial') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = font;
  const metrics = context.measureText(text ? String(text) : '');
  canvas.remove();
  return metrics.width;
}

export function hexToRGB(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return `rgb(${r}, ${g}, ${b})`;
}
