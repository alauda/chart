import { axesSpace } from './utils.js';
export const AXES_X_VALUES = [
  // tick incr          default           year                             month    day                        hour     min                sec       mode
  [3600 * 365, '{YYYY}', null, null, null, null, null, null, 1],
  [3600 * 24 * 30, '{YYYY}-{MM}-{DD}', null, null, null, null, null, null, 1],
  [3600 * 24 * 7, '{MM}-{DD}', null, null, null, null, null, null, 1],
  [3600 * 24 * 3, '{MM}-{DD} {HH}:{mm}', null, null, null, null, null, null, 1],
  [3600 * 24, '{MM}-{DD} {HH}:{mm}', null, null, null, null, null, null, 1],
  [3600 * 12, '{MM}-{DD} {HH}:{mm}', null, null, null, null, null, null, 1],
  [3600, '{HH}:{mm}', null, null, null, null, null, null, 1],
  [60, '{HH}:{mm}', null, null, null, null, null, null, 1],
  [1, '{HH}:{mm}', null, null, null, null, null, null, 1],
  [0.001, '{mm}:{ss}', null, null, null, null, null, null, 1],
];
const DEFAULT_FONT = '12px "Roboto", "Helvetica", "Arial", sans-serif';
export const UPLOT_DEFAULT_OPTIONS = {
  padding: [16, 8, 0, 0],
  legend: {
    show: false,
    live: false, // 关闭当前值
  },
  scales: {
    y: {
      range: (_u: uPlot, dataMin: number, dataMax: number) => {
        const maxV = Math.max(dataMax ? dataMax + 5 : dataMax, 1);
        return [dataMin || 0, maxV];
      },
    },
  },
  axes: [
    {
      space: axesSpace,
      size: 20,
      border: {
        show: true,
        width: 1,
      },
      font: DEFAULT_FONT,
      values: AXES_X_VALUES,
      grid: {
        show: false,
        // width: 1,
      },
      ticks: {
        width: 1,
        size: 5,
      },

      // border: {
      //   show: true,
      //   width: 1,
      // }
    },
    {
      font: DEFAULT_FONT,
      border: {
        show: true,
        width: 1,
      },
      grid: {
        width: 1,
        dash: [4, 6],
      },
      ticks: {
        width: 1,
        size: 5,
      },
    },
  ],
  cursor: {
    y: false,
    points: {
      show: false,
    },
    drag: {
      x: false,
      y: false,
      setScale: false,
      uni: 10,
    },
    focus: {
      prox: 30, // 鼠标移入点激活  像素激活距离
    },
  },
};
