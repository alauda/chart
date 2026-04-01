import { template as _template } from 'lodash-es';

import { CHART_PREFIX } from './constant.js';

export function generateName(name: string) {
  return `${CHART_PREFIX}-${name}`;
}

const TEMPLATE_OPTIONS = {
  // eslint-disable-next-line regexp/match-any
  interpolate: /{([\S\s]+?)}/g,
};

export function template(str: string, data: object) {
  return _template(str, TEMPLATE_OPTIONS)(data);
}
