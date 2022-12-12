# View

> 控制单元， 容器，组装 数据 策略、component 的一个容器
> 布局、初始化 组件、options、事件、主题

## 职责

- 初始化 组件、options、事件、主题、策略

- 暴露 api

- 管理组件，组件通讯

## Api

> 提供 命令式 api

```ts
// 绑定数据
view.data([]);

// 设置主题 内置 light dark 可自定义
view.theme(theme);

// 获取主题配置
view.getTheme();

// 获取所有配置
view.getOption();

// 设置组件配置 详细查看各组件配置文档
view.title(option);
view.legend(option);
view.tooltip(option);
view.axis('x', option);
view.shape('line', option);
view.annotation(option);
```

## Option

> view 参数配置

```ts
export interface ViewOption {
  readonly ele: HTMLElement; // 容器元素
  width?: number;
  height?: number;
  padding?: number[];
  data?: Data; // 数据
  options?: Options; // 配置
}

export interface Options {
  title?: TitleOption; //
  // ... component 待补充完整
}
```

## View Strategy

> 视图策略，根据不同策略 组件初始化、option 转换 ，渲染等
> chart 内部由两种策略模式，
> uPlot：由第三方库 uPlot 渲染，支持有坐标轴的图表 line area point bar 等
> internal： 内部实现图表，例如 pie gauge
> 支持增加新策略，例如使用第三方画其他类型图表

### View Strategy Manager

> view 策略管理
> 策略： internal uPlot

```ts
export class ViewStrategyManager {
  strategy = new Map<string, ViewStrategy>();
  // 添加策略
  add(strategy: ViewStrategy) {}
  // 根据名称获取策略
  getStrategy(name: string) {}
  // 获取所有策略实例
  getAllStrategy() {}
  // 获取所有策略下的组件
  getComponent() {}
}
```

#### View Strategy

> 视图策略：类似子 view
> 负责：根据当前策略 组件初始化、适配 option (转换: 数据、主题、配置)、渲染等

```ts
/**
 * view strategy 视图策略抽象类
 * 规范 strategy 的实现
 */
export abstract class ViewStrategy {
  // 当前策略名称
  public abstract get name(): string;

  // 当前策略需要的组件
  public abstract get component(): string[];

  // 存储当前策略下实力化的组件
  public components: BaseComponent[] = [];

  // 初始化
  public abstract init(): void;

  // 渲染函数
  public abstract render(): void;

  // 全局配置的组件
  readonly usedComponent: string[] = getComponentNames();

  readonly ctrl: View;

  constructor(view: View) {
    this.ctrl = view;
    this.initComponent();
    this.init();
  }

  /**
   * 根据当前策略初始化组件
   */
  initComponent() {}

  public destroy() {}
}
```

### Strategy 使用方式

> view 中初始化策略

```ts
private initViewStrategy() {
  this.strategyManage = new ViewStrategyManager();

  const uPlot = new UPlotViewStrategy(this);

  const internal = new InternalViewStrategy(this);

  this.strategyManage.add(uPlot);

  this.strategyManage.add(internal);

  this.strategy = this.strategyManage.getAllStrategy();
}
```
