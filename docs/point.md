# Point

> 用于绘制散点图和气泡图

## 职责

- 绘制散点图和气泡图
- 支持自定义点大小
- 支持根据数据字段映射点大小
- 支持设置点大小范围
- 支持自定义大小回调函数
- 支持交互效果和工具提示

## Api

> 提供命令式和配置式两种API

```ts
// 命令式
chart.point(option);

// 配置式
new Chart({ point: option });
```

## Option

> Point 组件的参数配置

```ts
export interface PointShapeOption extends ShapeOption {
  pointSize?: number; // 点大小 默认 5
  sizeField?: string; // 设置 size 映射key 默认 'size'
  sizeCallback?: SizeCallback; // 设置size 回调 支持用户自定义大小 返回点大小
}

export type SizeCallback = (...args: unknown[]) => number;

// 基础图形配置
export interface ShapeOption extends uPlot.Series {
  name?: string; // 指定 data name
  connectNulls?: boolean; // 是否链接空值 默认 false
  width?: number; // 线宽
  alpha?: number; // 透明度
  map?: string; // 指定映射关系为 data name
}
```

## 方法

### map(name: string)

指定数据映射的名称

```ts
chart.point().map('point1');
```

### size(field: number | string, options?: [number, number] | SizeCallback)

设置点的大小配置

```ts
// 设置固定点大小
chart.point().size(8);

// 设置点大小映射字段
chart.point().size('population');

// 设置点大小范围
chart.point().size('population', [5, 20]);

// 自定义大小回调函数
chart.point().size('value', (value) => {
  return Math.sqrt(value) * 2;
});
```

## 数据格式

> Point 组件支持的数据格式

```ts
export interface DataItem {
  name: string; // 数据名称
  color?: string; // 自定义颜色
  values?: DataValue[]; // 数据值数组
  floatValues?: TypedArray[]; // 类型化数组数据
}

export interface DataValue {
  x: any; // x轴值
  y: number; // y轴值
  size?: number; // 点大小
}
```

## 示例

### 基础散点图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'scatter',
      values: [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
        { x: 3, y: 15 },
        { x: 4, y: 25 },
        { x: 5, y: 30 },
      ],
    },
  ],
  options: {
    title: { text: '散点图' },
  },
});
chart.point();
chart.render();
```

### 气泡图（根据数据映射点大小）

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'bubble',
      values: [
        { x: 1, y: 10, size: 5 },
        { x: 2, y: 20, size: 10 },
        { x: 3, y: 15, size: 8 },
        { x: 4, y: 25, size: 12 },
        { x: 5, y: 30, size: 6 },
      ],
    },
  ],
  options: {
    title: { text: '气泡图' },
    point: {
      sizeField: 'size',
      pointSize: 5,
    },
  },
});
chart.point();
chart.render();
```

### 自定义点大小范围的气泡图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'bubble',
      values: [
        { x: 1, y: 10, size: 100 },
        { x: 2, y: 20, size: 200 },
        { x: 3, y: 15, size: 150 },
        { x: 4, y: 25, size: 250 },
        { x: 5, y: 30, size: 300 },
      ],
    },
  ],
  options: {
    title: { text: '自定义点大小范围的气泡图' },
    point: {
      sizeField: 'size',
    },
  },
});
chart.point().size('size', [5, 20]);
chart.render();
```

### 使用自定义大小回调函数的气泡图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'bubble',
      values: [
        { x: 1, y: 10, value: 100 },
        { x: 2, y: 20, value: 400 },
        { x: 3, y: 15, value: 225 },
        { x: 4, y: 25, value: 625 },
        { x: 5, y: 30, value: 900 },
      ],
    },
  ],
  options: {
    title: { text: '使用自定义大小回调函数的气泡图' },
  },
});
chart.point().size('value', (value) => {
  return Math.sqrt(value) / 5;
});
chart.render();
```

### 多组数据的散点图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'group1',
      color: 'rgb(var(--aui-color-blue))',
      values: [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
        { x: 3, y: 15 },
      ],
    },
    {
      name: 'group2',
      color: 'rgb(var(--aui-color-red))',
      values: [
        { x: 2, y: 18 },
        { x: 3, y: 22 },
        { x: 4, y: 16 },
      ],
    },
  ],
  options: {
    title: { text: '多组数据的散点图' },
  },
});
chart.point();
chart.render();
```
