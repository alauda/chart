export const CHART_PREFIX = 'achart';
export const HYPHEN = '-';
export const NOT_AVAILABLE = HYPHEN;

export const DEFAULT_COLORS = [
  '#006eff',
  '#24b37a',
  '#8b37c1',
  '#ffbb00',
  '#d42d3d',
  '#1fc0cc',
  '#a5d936',
  '#d563c4',
  '#c55a05',
  '#6b8fbb',
  '#1292d2',
  '#36d940',
  '#ea0abb',
  '#ead925',
  '#b0b55c',
];

export enum CHART_EVENTS {
  // theme
  THEME_CHANGE = 'theme:change',

  // uPlot hooks
  U_PLOT_READY = 'uPlot:ready',
  U_PLOT_SET_CURSOR = 'uPlot:setCursor',
  U_PLOT_OVER_MOUSEENTER = 'uPlotOver:mouseenter',
  U_PLOT_OVER_MOUSELEAVE = 'uPlotOver:mouseleave',

  // legend
  LEGEND_ITEM_CLICK = 'legend-item:click',
  LEGEND_ITEM_HOVER = 'legend-item:hover',

  // shape
  SHAPE_CHANGE = 'shape:change',

  // data
  DATA_CHANGE = 'data:change',
}

/**
 * 布局方位
 */
export enum DIRECTION {
  TOP = 'top',
  TOP_LEFT = 'top-left',
  TOP_RIGHT = 'top-right',
  // RIGHT = 'right',
  // RIGHT_TOP = 'right-top',
  // RIGHT_BOTTOM = 'right-bottom',
  // LEFT = 'left',
  // LEFT_TOP = 'left-top',
  // LEFT_BOTTOM = 'left-bottom',
  BOTTOM = 'bottom',
  BOTTOM_LEFT = 'bottom-left',
  BOTTOM_RIGHT = 'bottom-right',
  // no direction information
  NONE = 'none',
}

export enum INTERACTION_TYPE {
  TOOLTIP = 'tooltip',
  ELEMENT_ACTIVE = 'element_active',

  // legend
  LEGEND_FILTER = 'legend-filter',
  LEGEND_ACTIVE = 'legend-active',
}

export const DEFAULT_INTERACTIONS = [
  INTERACTION_TYPE.TOOLTIP,
  INTERACTION_TYPE.ELEMENT_ACTIVE,
  INTERACTION_TYPE.LEGEND_FILTER,
  INTERACTION_TYPE.LEGEND_ACTIVE,
];
