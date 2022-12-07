# Chart

> 用于提供创建 svg、自适应图表大小等配置, 继承于 View，有着 View 的 api
>
> 职责：创建 容器 计算大小、resize 重新计算、初始化默认 interaction

## 职责

- 设置主题
- 初始化 interaction
- 图表宽高自适应事件绑定
- destroy

## 结构
```
alauda-chart
├─ src
│  ├─ chart
│  │  ├─ index.ts
│  │  └─ view.ts
│  ├─ components // 组件 title legend tooltip shape....
|  │  ├─ annotation // 辅助组件 line text 阀值线标尺等
|  │  ├─ axis // 坐标
|  │  ├─ base // abstract component 抽象类
|  │  ├─ index // 负责组件的注册、删除、获取等
|  │  ├─ title // 标题
|  │  ├─ legend // 图例
|  │  ├─ shape // 图形
      └─ tooltip // 工具提示
│  ├─ interactions // 交互类
|  │  ├─ index.ts
│  ├─ themme // 主题
│  ├─ utils // 工具
│  │  ├─ constant.ts // 常量
│  │  ├─ util.ts // 工具
│  ├─ index.ts // 入口文件-- 导出chart相关 及 注册（组件、事件等）
└─
```

## Api

> 命令式：同时支持 options 配置

```ts
const chart = new Chart({
  container: 'chart',
  data: [],
  options: Options
});

chart.data([])
chart.tite(option)
chart.legend(option)
// ....component
```

#### Option

```ts
interface ChartOption {
  // 绘制的 DOM 可以是 DOM select  也可以是 DOM 实例
  container: string | HTMLElement;
  // 图表宽高度 不设置默认根据父容器高度自适应
  width?: number;
  height?: number;
  // 默认交互 ['tooltip', 'legend-filter', 'legend-active']
  defaultInteractions?: string[];
  // 图表组件等相关的配置。同时支持配置式 和 声明式
  options: Options;
  // 主题
  theme: Theme
}

interface Options {
  axis?: Axis;
  legend: Legend;
  scale: Scale;
  // ....
}
```

