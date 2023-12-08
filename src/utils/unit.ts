import { template as _template } from 'lodash';

import { CHART_PREFIX, DEFAULT_COLORS } from './constant.js';

export function getChartColor(index: number) {
  const colorIndex = index % DEFAULT_COLORS.length;
  return DEFAULT_COLORS[colorIndex];
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
