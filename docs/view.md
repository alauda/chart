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
view.title(option); // 标题
view.legend(option); // 图例
view.axis('x', option); // 坐标系
view.scale('x', options); // 度量
view.shape('line', option); // 设置图形
view.annotation(option); // 标注
view.coordinate(option); // 坐标系
view.tooltip(options); // 工具提示
view.theme(theme); // 设置主题
view.redraw(); // 重绘
view.destroy(); // 销毁图表
```

## Option

> view 参数配置

```ts
export interface ViewOption {
  // chart option 类似
  readonly ele: HTMLElement; // 容器元素
  width?: number;
  height?: number;
  padding?: number[];
  data?: Data; // 数据
  options?: Options; // 配置
}

export interface Options {
  title?: TitleOption;
  // ... component
}
```

## View Strategy

> 视图策略，根据不同策略 组件初始化、option 转换 ，渲染等
> chart 内部由两种策略模式，
> uPlot：由第三方库 uPlot 渲染，支持有坐标轴的图表 line area point bar 等
> internal： 内部实现图表，例如 pie gauge
> 支持增加新策略，例如使用第三方画其他类型图表
