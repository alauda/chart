import _Chart from './chart';
import _View from './chart/view';
import { Options, Theme } from './types';

export const Chart = (options: Options) => new _Chart(options);

export const setTheme = (theme: Theme) => _View.setTheme(theme);

// export * from './chart/view';
export { default as AChart } from './chart';
export { default as AView } from './chart/view';
export * from './components';
export * from './constant';
export * from './service';
export * from './types';
export * from './utils';
