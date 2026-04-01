# Pie

> 用于绘制饼图/环形图

## 职责

- 绘制饼图和环形图
- 支持自定义内外半径和圆角
- 支持标签引导线和文本显示
- 支持交互效果（悬停放大、高亮等）
- 支持自定义颜色和样式

## Api

> 提供命令式和配置式两种API

```ts
// 命令式
chart.pie(option);

// 配置式
new Chart({ pie: option });
```

## Option

> Pie 组件的参数配置

```ts
export interface PieShapeOption {
  innerRadius?: number; // 内半径 0 - 1
  outerRadius?: number; // 外半径
  startAngle?: number; // 开始角度
  endAngle?: number; // 结束角度
  padAngle?: number; // 扇区间的间距
  label?: {
    text?: string | ((value: number, total?: number) => string); // 中心文本
    description?: string | ((data: Data) => string); // 描述文本
    position?: {
      x?: number; // 文本位置 x 偏移
      y?: number; // 文本位置 y 偏移
    };
  };
  labelLine?: {
    labels?: Array<'name' | 'value' | 'percent'>; // 标签显示内容
    show?: boolean; // 是否显示标签引导线
    formatter?: string | ((data: unknown, percent: number) => string); // 标签格式化器
  };
  total?: number; // 指定总量
  backgroundColor?: string; // 背景颜色
  backgroundArc?: boolean; // 背景圆弧
  itemStyle?: {
    borderRadius?: number; // 扇区圆角
    borderWidth?: number; // 扇区间隔宽度
  };
  innerDisc?: boolean; // 内阴影盘
}
```

## 数据格式

> Pie 组件支持的数据格式

```ts
export interface DataItem {
  name: string; // 数据名称
  value?: number; // 数据值
  color?: string; // 自定义颜色
  stack?: string; // 堆叠分组名称
}
```

## 示例

### 基础饼图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    { name: 'A', value: 30 },
    { name: 'B', value: 20 },
    { name: 'C', value: 15 },
    { name: 'D', value: 35 },
  ],
  options: {
    title: { text: '饼图' },
  },
});
chart.pie();
chart.render();
```

### 环形图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    { name: 'A', value: 30 },
    { name: 'B', value: 20 },
    { name: 'C', value: 15 },
    { name: 'D', value: 35 },
  ],
  options: {
    title: { text: '环形图' },
    pie: {
      innerRadius: 0.6,
    },
  },
});
chart.pie();
chart.render();
```

### 带标签的饼图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    { name: 'A', value: 30 },
    { name: 'B', value: 20 },
    { name: 'C', value: 15 },
    { name: 'D', value: 35 },
  ],
  options: {
    title: { text: '带标签的饼图' },
    pie: {
      labelLine: {
        show: true,
        labels: ['name', 'value', 'percent'],
      },
    },
  },
});
chart.pie();
chart.render();
```

### 自定义颜色的饼图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    { name: 'A', value: 30, color: 'rgb(255, 99, 132)' },
    { name: 'B', value: 20, color: 'rgb(54, 162, 235)' },
    { name: 'C', value: 15, color: 'rgb(255, 205, 86)' },
    { name: 'D', value: 35, color: 'rgb(75, 192, 192)' },
  ],
  options: {
    title: { text: '自定义颜色的饼图' },
  },
});
chart.pie();
chart.render();
```

### 带中心文本的饼图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    { name: 'A', value: 30 },
    { name: 'B', value: 20 },
    { name: 'C', value: 15 },
    { name: 'D', value: 35 },
  ],
  options: {
    title: { text: '带中心文本的饼图' },
    pie: {
      label: {
        text: '总计: {value}',
        description: '各部分占比',
      },
    },
  },
});
chart.pie();
chart.render();
```

### 圆角饼图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    { name: 'A', value: 30 },
    { name: 'B', value: 20 },
    { name: 'C', value: 15 },
    { name: 'D', value: 35 },
  ],
  options: {
    title: { text: '圆角饼图' },
    pie: {
      itemStyle: {
        borderRadius: 8,
        borderWidth: 2,
      },
    },
  },
});
chart.pie();
chart.render();
```
