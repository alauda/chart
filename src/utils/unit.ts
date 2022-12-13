import { CHART_PREFIX, DEFAULT_COLORS } from './constant.js';

export function getChartColor(index: number) {
  const colorIndex = index % DEFAULT_COLORS.length;
  return DEFAULT_COLORS[colorIndex];
}

export function generateElName(name: string) {
  return `${CHART_PREFIX}-${name}`;
}
