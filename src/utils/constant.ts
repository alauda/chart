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

export enum INTERACTION_TYPE {
  TOOLTIP = 'tooltip',
  ELEMENT_ACTIVE = 'element-active',

  // legend
  LEGEND_FILTER = 'legend-filter',
  LEGEND_ACTIVE = 'legend-active',
}

export const DEFAULT_INTERACTIONS = [
  INTERACTION_TYPE.TOOLTIP,
  // INTERACTION_TYPE.ELEMENT_ACTIVE,
  // INTERACTION_TYPE.LEGEND_FILTER,
  INTERACTION_TYPE.LEGEND_ACTIVE,
];
