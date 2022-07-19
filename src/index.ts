/// <reference types="typed-query-selector/strict" />

import { Chart as AChart, View as AView } from './chart';
import { Options, Theme } from './types';

export const Chart = (options: Options) => new AChart(options);

export const setTheme = (theme: Theme) => AView.setTheme(theme);

export { Chart as AChart, View as AView } from './chart';
export * from './components';
export * from './constant';
export * from './service';
export * from './types';
export * from './utils';
