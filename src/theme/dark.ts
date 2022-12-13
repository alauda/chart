import { Theme, ThemeOptions } from '../index.js';

const LEGEND = {};

const TITLE = {};

const AXIS = {};

const SHAPE = {
  point: {
    size: 5,
  },
};

/**
 * Dark theme.
 */
export const Dark = (options?: ThemeOptions): ThemeOptions => {
  const defaultOptions: Theme = {
    type: 'dark',
    legend: LEGEND,
    title: TITLE,
    xAxis: AXIS,
    yAxis: AXIS,
    shape: SHAPE,
  };
  return { ...defaultOptions, ...options };
};
