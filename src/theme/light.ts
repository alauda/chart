import { Theme, ThemeOptions } from '../index.js';

const COLORS = {
  blue: '#007af5',
  'b-0': '#0067d0',
  'b-1': '#268df6',
  'b-2': '#4da2f8',
  'b-3': '#66aff9',
  'b-4': '#b3d7fc',
  'b-5': '#cce4fd',
  'b-6': '#e5f1fe',
  'b-7': '#f2f8fe',
  green: '#00c261',
  'g-0': '#00a552',
  'g-1': '#26cb78',
  'g-2': '#4cd490',
  'g-4': '#b3eccf',
  'g-6': '#e6f9ef',
  'g-7': '#f2fbf6',
  yellow: '#f5a300',
  'y-0': '#dc9200',
  'y-1': '#f6b026',
  'y-2': '#f8be4d',
  'y-4': '#fce3b3',
  'y-6': '#fef5e6',
  'y-7': '#fefaf3',
  red: '#eb0027',
  'r-0': '#c70021',
  'r-1': '#ed2647',
  'r-2': '#f14c67',
  'r-4': '#f9b3be',
  'r-6': '#fde6e9',
  'r-7': '#fef3f4',
  'n-1': '#323437',
  'n-2': '#646669',
  'n-3': '#7c7e81',
  'n-4': '#96989b',
  'n-5': '#aeb0b3',
  'n-6': '#c8cacd',
  'n-7': '#d4d6d9',
  'n-8': '#edeff2',
  'n-9': '#f7f9fc',
  'n-10': '#fff',
};

const LEGEND = {};

const TITLE = {};

const AXIS = {
  stroke: COLORS['n-2'],
  gridStroke: COLORS['n-8'],
  tickStroke: COLORS['n-8'],
};

const SHAPE = {
  point: {
    size: 5,
  },
};

/**
 * Light theme.
 */
export const Light = (options?: ThemeOptions): ThemeOptions => {
  const defaultOptions: Theme = {
    legend: LEGEND,
    title: TITLE,
    xAxis: AXIS,
    yAxis: AXIS,
    shape: SHAPE,
  };
  return { ...defaultOptions, ...options };
};
