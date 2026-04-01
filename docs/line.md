# Line

> 用于绘制折线图、曲线图、阶梯线图等

## 职责

- 绘制折线图、曲线图、阶梯线图
- 支持连接空值数据点
- 支持显示数据点标记
- 支持设置线宽和透明度
- 支持阶梯线效果

## Api

> 提供命令式和配置式两种API

```ts
// 命令式
chart.line(option);

// 配置式
new Chart({ line: option });
```

## Option

> Line 组件的参数配置

```ts
export interface LineShapeOption extends ShapeOption {
  step?: 'start' | 'end'; // 阶梯线类型，'start' 表示从起点开始阶梯，'end' 表示从终点开始阶梯
}

// 基础图形配置
export interface ShapeOption extends uPlot.Series {
  name?: string; // 指定 data name
  connectNulls?: boolean; // 是否链接空值 默认 false
  width?: number; // 线宽
  alpha?: number; // 透明度
  map?: string; // 指定映射关系为 data name
  points?: Omit<uPlot.Series.Points, 'show'> | boolean; // 是否显示数据点 默认 false
}
```

## 方法

### map(name: string)

指定数据映射的名称

```ts
chart.line().map('line1');
```

### step(type: 'start' | 'end')

设置阶梯线类型

```ts
chart.line().step('start');
```

## 示例

### 基础折线图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'line',
      floatValues: generateData('2023-01-31 09:00:00', 60, 60),
    },
  ],
  options: {
    title: { text: '折线图' },
    line: {
      width: 2,
      alpha: 0.8,
      points: true,
    },
  },
});
chart.line();
chart.render();
```

### 阶梯线图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'line',
      floatValues: generateData('2023-01-31 09:00:00', 60, 60),
    },
  ],
  options: {
    title: { text: '阶梯线图' },
    line: {
      step: 'start',
    },
  },
});
chart.line();
chart.render();
```

### 连接空值

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'line',
      values: [
        { x: 1, y: 2 },
        { x: 2, y: null },
        { x: 3, y: 5 },
        { x: 4, y: 4 },
      ],
    },
  ],
  options: {
    title: { text: '连接空值' },
    line: {
      connectNulls: true,
    },
  },
});
chart.line();
chart.render();
```
