# BarStacked

> 用于绘制堆叠柱状图

## 职责

- 绘制堆叠柱状图
- 支持多组数据堆叠显示
- 支持自定义柱宽
- 支持响应式布局
- 支持交互事件和工具提示

## Api

> 提供命令式和配置式两种API

```ts
// 命令式
chart.barStacked(option);

// 配置式
new Chart({ barStacked: option });
```

## Option

> BarStacked 组件的参数配置

```ts
export interface BarStackedShapeOption extends ShapeOption {
  barWidth?: number; // 柱宽
}

// 基础图形配置
export interface ShapeOption extends uPlot.Series {
  name?: string; // 指定 data name
  connectNulls?: boolean; // 是否链接空值 默认 false
  width?: number; // 线宽
  alpha?: number; // 透明度
  map?: string; // 指定映射关系为 data name
}
```

## 数据格式

> BarStacked 组件支持的数据格式

```ts
export interface DataItem {
  name: string; // 数据名称
  color?: string; // 自定义颜色
  stack?: string; // 堆叠分组名称
  values?: DataValue[]; // 数据值数组
  floatValues?: TypedArray[]; // 类型化数组数据
}

export interface DataValue {
  x: any; // x轴值
  y: number; // y轴值
}
```

## 示例

### 基础堆叠柱状图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'A',
      stack: 'group1',
      values: [
        { x: 'Jan', y: 10 },
        { x: 'Feb', y: 20 },
        { x: 'Mar', y: 15 },
      ],
    },
    {
      name: 'B',
      stack: 'group1',
      values: [
        { x: 'Jan', y: 15 },
        { x: 'Feb', y: 25 },
        { x: 'Mar', y: 20 },
      ],
    },
  ],
  options: {
    title: { text: '堆叠柱状图' },
    axis: {
      x: {
        categories: ['Jan', 'Feb', 'Mar'],
      },
    },
  },
});
chart.barStacked();
chart.render();
```

### 自定义柱宽的堆叠柱状图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'A',
      stack: 'group1',
      values: [
        { x: 'Jan', y: 10 },
        { x: 'Feb', y: 20 },
        { x: 'Mar', y: 15 },
      ],
    },
    {
      name: 'B',
      stack: 'group1',
      values: [
        { x: 'Jan', y: 15 },
        { x: 'Feb', y: 25 },
        { x: 'Mar', y: 20 },
      ],
    },
  ],
  options: {
    title: { text: '自定义柱宽的堆叠柱状图' },
    axis: {
      x: {
        categories: ['Jan', 'Feb', 'Mar'],
      },
    },
    barStacked: {
      barWidth: 40,
    },
  },
});
chart.barStacked();
chart.render();
```

### 多组堆叠柱状图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'A',
      stack: 'group1',
      values: [
        { x: 'Jan', y: 10 },
        { x: 'Feb', y: 20 },
        { x: 'Mar', y: 15 },
      ],
    },
    {
      name: 'B',
      stack: 'group1',
      values: [
        { x: 'Jan', y: 15 },
        { x: 'Feb', y: 25 },
        { x: 'Mar', y: 20 },
      ],
    },
    {
      name: 'C',
      stack: 'group2',
      values: [
        { x: 'Jan', y: 5 },
        { x: 'Feb', y: 10 },
        { x: 'Mar', y: 8 },
      ],
    },
    {
      name: 'D',
      stack: 'group2',
      values: [
        { x: 'Jan', y: 8 },
        { x: 'Feb', y: 12 },
        { x: 'Mar', y: 10 },
      ],
    },
  ],
  options: {
    title: { text: '多组堆叠柱状图' },
    axis: {
      x: {
        categories: ['Jan', 'Feb', 'Mar'],
      },
    },
  },
});
chart.barStacked();
chart.render();
```

### 自定义颜色的堆叠柱状图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'A',
      color: 'rgb(255, 99, 132)',
      stack: 'group1',
      values: [
        { x: 'Jan', y: 10 },
        { x: 'Feb', y: 20 },
        { x: 'Mar', y: 15 },
      ],
    },
    {
      name: 'B',
      color: 'rgb(54, 162, 235)',
      stack: 'group1',
      values: [
        { x: 'Jan', y: 15 },
        { x: 'Feb', y: 25 },
        { x: 'Mar', y: 20 },
      ],
    },
  ],
  options: {
    title: { text: '自定义颜色的堆叠柱状图' },
    axis: {
      x: {
        categories: ['Jan', 'Feb', 'Mar'],
      },
    },
  },
});
chart.barStacked();
chart.render();
```
