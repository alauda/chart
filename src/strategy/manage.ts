import { ViewStrategy } from './abstract.js';

/**
 * view 策略管理
 * internal uPlot
 *
 * 关联：组件、option、 data、theme、render
 */
export class ViewStrategyManager {
  strategy = new Map<string, ViewStrategy>();

  /**
   * 添加策略
   * @param strategy 策略
   */
  add(strategy: ViewStrategy) {
    this.strategy.set(strategy.name, strategy);
  }

  /**
   * 根据名称获取对应策略
   * @param name 策略名称
   * @returns 策略实例
   */
  getStrategy(name: string) {
    return this.strategy.get(name);
  }

  /**
   * 获取所有策略
   * @returns 获取当前所有策略实例
   */
  getAllStrategy() {
    return [...this.strategy.values()];
  }

  /**
   * 获取所有策略下的组件
   * @returns 获取当前策略所有组件
   */
  getComponent() {
    const all = this.getAllStrategy();
    return all.flatMap(ctrl => ctrl.components);
  }
}

// // 子 view
// class UPlotStrategy {
//   name: 'uPlot'
//   component = ['axis', 'tooltip', 'legend', 'line', 'area', 'point', 'bar'];
//   handleData() {}
// }

// class InternalStrategy {
//   name: 'internal'
//   component = ['title', 'legend', 'pie', 'gauge', 'tooltip'];
//   handleData() {}

//   render (option:any) {
//     this.dom
//   }

//   getOption () {}
// }

// const strategyManager = new StrategyManager();
// strategyManager.add(new UPlotStrategy())

// const uPlotS = strategyManager.getStrategy('uPlot')
// uPlotS.getOption();
