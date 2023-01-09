import { Theme, ThemeOptions } from '../index.js';

const COLORS = {
  blue: '#3d8eff',
  'b-0': '#3674cc',
  'b-1': '#6daaff',
  'b-2': '#356fc1',
  'b-3': '#3265ad',
  'b-4': '#2f558f',
  'b-5': '#283651',
  'b-6': '#2a4066',
  'b-7': '#2c4a7a',
  green: '#11b671',
  'g-0': '#159261',
  'g-1': '#4cc894',
  'g-2': '#168b5d',
  'g-4': '#1b674e',
  'g-6': '#1f4a42',
  'g-7': '#1c5848',
  yellow: '#edac2c',
  'y-0': '#ba8a2d',
  'y-1': '#f1c060',
  'y-2': '#b0842d',
  'y-4': '#7e622f',
  'y-6': '#564831',
  'y-7': '#695530',
  red: '#e2324f',
  'r-0': '#b22f48',
  'r-1': '#e9657b',
  'r-2': '#a82e46',
  'r-4': '#792b3f',
  'r-6': '#532939',
  'r-7': '#652a3c',
  'n-1': '#f3f4f8',
  'n-2': '#c8c9cd',
  'n-3': '#b8bac2',
  'n-4': '#989aa2',
  'n-5': '#90939f',
  'n-6': '#787b87',
  'n-7': '#5c5f6b',
  'n-8': '#434652',
  'n-9': '#181b27',
  'n-10': '#242733',
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
