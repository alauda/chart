import { registerShape } from './chart/view.js';
import { Axis } from './components/axis.js';
import { registerComponent } from './components/index.js';
import { Legend } from './components/legend.js';
import Area from './components/shape/area.js';
import Bar from './components/shape/bar.js';
import Line from './components/shape/line.js';
import Point from './components/shape/point.js';
import { Title } from './components/title.js';
import { Tooltip } from './components/tooltip.js';
import { Dark, registerTheme } from './theme/index.js';
import {
  AreaShapeOption,
  BarShapeOption,
  LineShapeOption,
  PointShapeOption,
} from './types/options.js';

export * from './chart/index.js';
export * from './types/index.js';
export * from './utils/index.js';

// register component
registerComponent('title', Title);

registerComponent('legend', Legend);

registerComponent('tooltip', Tooltip);

registerComponent('axis', Axis);

// 注册黑暗主题
registerTheme('dark', Dark());

/**
 * 往 View 原型上添加的创建 shape 的方法
 *
 * Tips:
 * view module augmentation, detail: http://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
 */
declare module './chart/view.js' {
  interface View {
    line(option?: LineShapeOption): Line;

    area(option?: AreaShapeOption): Area;

    bar(option?: BarShapeOption): Bar;

    point(option?: PointShapeOption): Point;
  }
}

registerShape('line', Line);

registerShape('area', Area);

registerShape('point', Point);

registerShape('Bar', Bar);
