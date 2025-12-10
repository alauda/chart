import { template as _template } from 'lodash-es';

import { CHART_PREFIX, DEFAULT_COLORS } from './constant.js';

const colorMap = new Map<string, string>();

export function getChartColor(key?: string) {
  if (colorMap.has(key)) {
    return colorMap.get(key)!;
  }

  const color = DEFAULT_COLORS[colorMap.size % DEFAULT_COLORS.length];
  colorMap.set(key, color);
  return color;
}

export function cleanupChartColors(keys: string[]) {
  const currentKeys = new Set(keys);
  for (const key of colorMap.keys()) {
    if (!currentKeys.has(key)) {
      colorMap.delete(key);
    }
  }
}

export function resetColorMap() {
  colorMap.clear();
}

export function generateName(name: string) {
  return `${CHART_PREFIX}-${name}`;
}

const TEMPLATE_OPTIONS = {
  // eslint-disable-next-line regexp/match-any
  interpolate: /{([\S\s]+?)}/g,
};

export function template(str: string, data: object) {
  return _template(str, TEMPLATE_OPTIONS)(data);
}
