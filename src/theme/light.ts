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
 * Light theme.
 */
export const Light = (options?: ThemeOptions) => {
  const defaultOptions: Theme = {
    legend: LEGEND,
    title: TITLE,
    xAxis: AXIS,
    yAxis: AXIS,
    shape: SHAPE,
  };
  return Object.assign({}, defaultOptions, options);
};
