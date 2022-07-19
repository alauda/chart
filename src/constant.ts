import { ControllerCtor } from './abstract/index.js';
import { Pie, Series, Axis } from './components/index.js';
import { Scale } from './service/index.js';
import { ChartType } from './types/index.js';

export enum LEGEND_EVENTS {
  // click 事件
  CLICK = 'legendItem:click',
  SELECT_ALL = 'legendItem:selectAll',
  UNSELECT_ALL = 'legendItem:unselectALl',
}

export enum PIE_EVENTS {
  ITEM_HOVERED = 'pieItem:hovered',
  ITEM_MOUSEOUT = 'pieItem:mouseout',
  ITEM_CLICK = 'pieItem:click',
}

export enum RECT_EVENTS {
  MOUSEDOWN = 'rect:mousedown',
  MOUSEMOVE = 'rect:mousemove',
  MOUSEUP = 'rect:mouseup',
  CLICK = 'rect:click',
}

export enum CLONE_PATCH_EVENTS {
  MOUSEDOWN = 'clone_path:mousedown',
  MOUSEMOVE = 'clone_path:mousemove',
  MOUSEUP = 'clone_path:mouseup',
}

export enum SCATTER_EVENTS {
  ITEM_HOVERED = 'scatterItem:hovered',
  ITEM_MOUSEOUT = 'scatterItem:mouseout',
  ITEM_CLICK = 'scatterItem:click',
}

export enum VIEW_HOOKS {
  AFTER_RENDER = 'after-render',
  CHANGE_DATA = 'change-data',
  SET_DATA = 'set-data',
  BEFORE_DESTROY = 'before-destroy',
  CHANGE_SIZE = 'change-size',
}

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

export const basics = {
  margin: { top: 0, right: 0, bottom: 20, left: 20 },
  padding: { left: 0 }, // title
  main: { top: 20 }, // grid
  tickLabelWidth: 0,
};

export const AC_PREFIX = 'ac';

export const CLASS_NAME = {
  title: getPrefixName('title'),
  titleText: getPrefixName('title-text'),
  legend: getPrefixName('legend'),
  legendItem: getPrefixName('legend-item'),
  legendItemEvent: getPrefixName('legend-item-event'),
  legendItemHidden: getPrefixName('legend-item-hidden'),
  legendItemIcon: getPrefixName('legend-icon'),
  legendItemActive: getPrefixName('legend-item-active'),

  chart: getPrefixName('chart'),
  lines: getPrefixName('lines'),
  line: getPrefixName('line'),
  cloneLine: getPrefixName('clone-line'),

  areas: getPrefixName('areas'),
  area: getPrefixName('area'),

  bars: getPrefixName('bars'),
  bar: getPrefixName('bar'),
  barItem: getPrefixName('bar-item'),
  cloneBar: getPrefixName('clone-bar'),

  scatter: getPrefixName('scatter'),
  scatters: getPrefixName('scatters'),
  cloneScatter: getPrefixName('clone-scatter'),
  scatterItem: getPrefixName('scatter-item'),

  xAxis: getPrefixName('x-axis'),
  yAxis: getPrefixName('y-axis'),

  tooltip: getPrefixName('tooltip'),

  tooltipTitle: getPrefixName('tooltip-title'),

  tooltipList: getPrefixName('tooltip-list'),

  tooltipListItem: getPrefixName('tooltip-list-item'),

  tooltipListItemActivated: getPrefixName('tooltip-list-item-activated'),

  eventRects: getPrefixName('event-rects'),

  eventRect: getPrefixName('event-rect'),

  crosshair: getPrefixName('crosshair'),

  zoomBrush: getPrefixName('zoom-brush'),

  yPlotLine: getPrefixName('y-plot-line'),
  yPlotLineTip: getPrefixName('y-plot-line-tip'),
  yPlotLineTipText: getPrefixName('y-plot-line-tip-text'),
  yPlotLineCircles: getPrefixName('y-plot-line-circles'),
  yPlotLineCircle: getPrefixName('y-plot-line-circle'),
  xPlotLine: getPrefixName('x-plot-line'),

  pie: getPrefixName('pie'),
  pies: getPrefixName('pies'),
  pieGuide: getPrefixName('pie-guide'),
} as const;

function getPrefixName<T extends string>(name: T) {
  return `${AC_PREFIX}-${name}` as const;
}

export const GRADIENT_PREFIX = 'gradient-';

export const STROKE_WIDTH = 'stroke-width';

export const DEFAULT_LINE_WIDTH = 2;

export const ACTIVE_STROKE_WIDTH = 3;

export const STROKE_DASHARRAY = '3,2';

export const DEFAULT_Y_SCALE_MAX = 1;

export const DEFAULT_Y_SCALE_MIN = 1;

export const DEFAULT_SCATTER_OPTIONS = {
  size: 5,
  minSize: 5,
  maxSize: 20,
  opacity: 0.2,
};

const COMMON_2D_DEPENDENCY = [Scale, Series, Axis];

export const CHART_DEPENDS_MAP: Record<ChartType, ControllerCtor[]> = {
  pie: [Pie],
  scatter: COMMON_2D_DEPENDENCY,
  area: COMMON_2D_DEPENDENCY,
  line: COMMON_2D_DEPENDENCY,
  bar: COMMON_2D_DEPENDENCY,
};

// 环形图hover时，环形放缩半径
export const DEFAULT_PIE_ACTIVE_ENLARGE_RADIUS = 4;
