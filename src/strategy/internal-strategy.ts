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
    // ..
  }

  render() {
    // ..
  }
}
