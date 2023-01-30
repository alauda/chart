export enum ChartEvent {
  // theme
  THEME_CHANGE = 'theme:change',

  // uPlot hooks
  U_PLOT_READY = 'uPlot:ready',
  U_PLOT_SET_CURSOR = 'uPlot:setCursor',

  // plot
  PLOT_MOUSEMOVE = 'plot:mousemove',
  PLOT_MOUSELEAVE = 'plot:mouseleave',

  // element
  ELEMENT_MOUSEMOVE = 'element:mousemove',
  ELEMENT_MOUSELEAVE = 'element:mouseleave',

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
