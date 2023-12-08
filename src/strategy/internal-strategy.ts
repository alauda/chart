import { PolarShape } from '../components/shape/index.js';

import { ViewStrategy } from './abstract.js';

/**
 * 渲染策略
 * internal 渲染图表
 */
export class InternalViewStrategy extends ViewStrategy {
  get name(): string {
    return 'internal';
  }

  get component(): string[] {
    return ['title', 'legend', 'pie', 'gauge'];
  }

  init() {
    // do nothing.
  }

  render() {
    this.component.forEach(c => {
      const comp = this.ctrl.shapeComponents.get(c) as PolarShape;
      comp?.render();
    });
  }
}
