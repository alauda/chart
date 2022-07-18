import _Chart from './chart';
import _View from './chart/view';
import {Options, Theme} from '@src/types';

export const Chart = (options: Options) => new _Chart(options);
export type AChart = _Chart;
export type View = _View;
export const setTheme = (theme: Theme) => _View.setTheme(theme);

export * from './chart/view';

export * from './types';
export * from './utils';
export * from './service';
export * from './components';
export * from './constant'
