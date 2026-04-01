# Gauge

> 用于绘制仪表盘图表

## 职责

- 绘制仪表盘图表
- 支持自定义颜色范围
- 支持设置最大值和显示范围
- 支持显示中心文本和描述
- 支持自定义文本样式

## Api

> 提供命令式和配置式两种API

```ts
// 命令式
chart.gauge(option);

// 配置式
new Chart({ gauge: option });
```

## Option

> Gauge 组件的参数配置

```ts
export interface GaugeShapeOption {
  innerRadius?: number; // 内半径 0 - 1
  outerRadius?: number; // 外半径
  max?: number; // 最大值，默认 100
  colors?: Array<[number, string]>; // 指定颜色范围 [数值, 颜色]
  label?: {
    text?: string | ((data: Data, total?: number) => string); // 中心文本
    description?: string | ((data: Data) => string); // 描述文本
    position?: {
      x?: number; // 文本位置 x 偏移
      y?: number; // 文本位置 y 偏移
    };
    textStyle?: {
      color?: string; // 文本颜色
    };
    descriptionStyle?: {
      color?: string; // 描述文本颜色
    };
  };
  text?: {
    show?: boolean; // 是否显示刻度文本，默认 true
    size?: number; // 字体大小，默认 12
    color?: string | ((value: number) => string); // 文本颜色，默认 n-4
  };
}
```

## 数据格式

> Gauge 组件支持的数据格式

```ts
export interface DataItem {
  name: string; // 数据名称
  value?: number; // 数据值
  color?: string; // 自定义颜色
}
```

## 示例

### 基础仪表盘

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'value',
      value: 75,
    },
  ],
  options: {
    title: { text: '仪表盘' },
    gauge: {
      max: 100,
    },
  },
});
chart.gauge();
chart.render();
```

### 自定义颜色范围的仪表盘

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'value',
      value: 65,
    },
  ],
  options: {
    title: { text: '自定义颜色范围的仪表盘' },
    gauge: {
      max: 100,
      colors: [
        [80, 'rgb(var(--aui-color-red))'],
        [60, 'rgb(var(--aui-color-yellow))'],
        [0, 'rgb(var(--aui-color-green))'],
      ],
    },
  },
});
chart.gauge();
chart.render();
```

### 显示中心文本和描述的仪表盘

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'value',
      value: 85,
    },
  ],
  options: {
    title: { text: '显示中心文本的仪表盘' },
    gauge: {
      max: 100,
      label: {
        text: '{value}%',
        description: '使用率',
      },
    },
  },
});
chart.gauge();
chart.render();
```

### 自定义文本样式的仪表盘

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'value',
      value: 92,
    },
  ],
  options: {
    title: { text: '自定义文本样式的仪表盘' },
    gauge: {
      max: 100,
      label: {
        text: (data, total) => `${total}%`,
        description: '完成率',
        textStyle: {
          color: 'rgb(var(--aui-color-green))',
        },
        descriptionStyle: {
          color: 'rgb(var(--aui-color-blue))',
        },
      },
    },
  },
});
chart.gauge();
chart.render();
```

### 隐藏刻度文本的仪表盘

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'value',
      value: 55,
    },
  ],
  options: {
    title: { text: '隐藏刻度文本的仪表盘' },
    gauge: {
      max: 100,
      text: {
        show: false,
      },
    },
  },
});
chart.gauge();
chart.render();
```
