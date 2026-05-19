# Bar

> 用于绘制柱状图

## 职责

- 绘制柱状图
- 支持分组和堆叠显示
- 支持设置柱宽和间距
- 支持自定义颜色和样式

## Api

> 提供命令式和配置式两种API

```ts
// 命令式
chart.bar(option);

// 配置式
new Chart({ bar: option });
```

## Option

> Bar 组件的参数配置

```ts
export interface BarShapeOption extends ShapeOption {
  barWidth?: number; // 柱宽，单位 px
  bandWidth?: number; // 柱宽别名，兼容旧 chart API，单位 px
  itemStyle?: {
    borderRadius?: number; // 柱子圆角，单位 px，需配合 barWidth/bandWidth 使用
  };
  adjust?: AdjustOption; // 调整配置
}

export type AdjustType = 'stack' | 'group';
export interface AdjustOption {
  type?: AdjustType; // 默认 group，分组显示
  marginRatio?: number; // type group 下有效，0-1 范围，默认 0.1
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

## 方法

### map(name: string)

指定数据映射的名称

```ts
chart.bar().map('bar1');
```

### adjust(adjustOpt: AdjustType | AdjustOption)

设置柱状图的调整选项

```ts
// 设置为堆叠模式
chart.bar().adjust('stack');

// 自定义调整选项
chart.bar().adjust({
  type: 'group',
  marginRatio: 0.3,
});
```

## 示例

### 基础柱状图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'bar',
      values: [
        { x: 'A', y: 10 },
        { x: 'B', y: 20 },
        { x: 'C', y: 15 },
        { x: 'D', y: 25 },
      ],
    },
  ],
  options: {
    title: { text: '柱状图' },
  },
});
chart.bar();
chart.render();
```

### 分组柱状图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'bar1',
      values: [
        { x: 'A', y: 10 },
        { x: 'B', y: 20 },
        { x: 'C', y: 15 },
      ],
    },
    {
      name: 'bar2',
      values: [
        { x: 'A', y: 15 },
        { x: 'B', y: 25 },
        { x: 'C', y: 20 },
      ],
    },
  ],
  options: {
    title: { text: '分组柱状图' },
    bar: {
      barWidth: 10,
      itemStyle: {
        borderRadius: 1,
      },
      adjust: {
        type: 'group',
        marginRatio: 0.2,
      },
    },
  },
});
chart.bar();
chart.render();
```

### 堆叠柱状图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'bar1',
      values: [
        { x: 'A', y: 10 },
        { x: 'B', y: 20 },
        { x: 'C', y: 15 },
      ],
    },
    {
      name: 'bar2',
      values: [
        { x: 'A', y: 15 },
        { x: 'B', y: 25 },
        { x: 'C', y: 20 },
      ],
    },
  ],
  options: {
    title: { text: '堆叠柱状图' },
    bar: {
      adjust: {
        type: 'stack',
      },
    },
  },
});
chart.bar();
chart.render();
```

### 自定义颜色的柱状图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'bar1',
      color: 'rgb(255, 99, 132)',
      values: [
        { x: 'A', y: 10 },
        { x: 'B', y: 20 },
        { x: 'C', y: 15 },
      ],
    },
    {
      name: 'bar2',
      color: 'rgb(54, 162, 235)',
      values: [
        { x: 'A', y: 15 },
        { x: 'B', y: 25 },
        { x: 'C', y: 20 },
      ],
    },
  ],
  options: {
    title: { text: '自定义颜色的柱状图' },
  },
});
chart.bar();
chart.render();
```
