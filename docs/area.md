# Area

> 用于绘制面积图

## 职责

- 绘制面积图
- 支持填充颜色和透明度
- 支持显示数据点标记
- 支持设置线宽和透明度

## Api

> 提供命令式和配置式两种API

```ts
// 命令式
chart.area(option);

// 配置式
new Chart({ area: option });
```

## Option

> Area 组件的参数配置

```ts
export interface AreaShapeOption extends ShapeOption {
  // Area组件继承了ShapeOption的所有配置
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
chart.area().map('area1');
```

## 示例

### 基础面积图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'area1',
      floatValues: generateData('2023-01-31 09:00:00', 60, 60),
    },
  ],
  options: {
    title: { text: '面积图' },
    area: {
      width: 2,
      alpha: 0.3,
    },
  },
});
chart.area();
chart.render();
```

### 面积图与折线图结合

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
    title: { text: '面积图与折线图结合' },
    line: {
      width: 2,
      alpha: 0.8,
    },
    area: {
      alpha: 0.3,
    },
  },
});
chart.line();
chart.area();
chart.render();
```

### 多组数据面积图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'area1',
      floatValues: generateData('2023-01-31 09:00:00', 60, 60),
    },
    {
      name: 'area2',
      floatValues: generateData('2023-01-31 09:00:00', 60, 60),
    },
  ],
  options: {
    title: { text: '多组数据面积图' },
    area: {
      alpha: 0.4,
    },
  },
});
chart.area();
chart.render();
```

### 显示数据点的面积图

```ts
const chart = new Chart({
  container: '.chart',
  data: [
    {
      name: 'area',
      floatValues: generateData('2023-01-31 09:00:00', 60, 60),
    },
  ],
  options: {
    title: { text: '显示数据点的面积图' },
    area: {
      alpha: 0.3,
      points: true,
    },
  },
});
chart.area();
chart.render();
```
