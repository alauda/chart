import { View } from '../chart/view.js';
import { BaseComponent } from '../components/base.js';
import { getComponent, getComponentNames } from '../components/index.js';

/**
 * view strategy 视图策略抽象类
 * 规范 strategy 的实现
 */
export abstract class ViewStrategy {
  // 当前策略名称
  abstract get name(): string;

  // 当前策略需要的组件
  abstract get component(): string[];

  // 存储当前策略下实力化的组件
  components: BaseComponent[] = [];

  // 初始化
  abstract init(): void;

  // 渲染函数
  abstract render(): void;

  // 全局配置的组件
  readonly usedComponent: string[] = getComponentNames();

  readonly ctrl: View;

  get options() {
    return this.ctrl.getOption();
  }

  constructor(view: View) {
    this.ctrl = view;
    this.initComponent();
    this.init();
  }

  /**
   * 根据当前策略初始化组件
   */
  initComponent() {
    for (const name of this.component) {
      const Component = getComponent(name);
      if (Component) {
        this.components.push(new Component(this.ctrl));
      }
    }
  }

  destroy() {
    this.components = [];
  }
}
