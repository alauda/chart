# Shape

> 图形

## Option

```ts
export interface ShapeOption {
  name?: string; // 指定 映射关系 为 data name
  connectNulls?: boolean; // 是否链接空值 默认 false
  points?: Omit<uPlot.Series.Points, 'show'> | boolean; // 默认 false
  width?: number; // 线宽 默认 1.5
  alpha?: number; // 透明度
  map?: string; // 指定 映射关系 为 data name
}

// map 指定 映射关系 为 data name
// 画出一条线 和 面积
chart.line().map('area1');
chart.area().map('area2');
```

## Line

> 用于绘制折线图、曲线图、阶梯线图等

### Api

```ts
chart.line(option); // 命令式

new Chart({ line: option }); // 配置式
```

### Option

```ts
export interface LineShapeOption extends ShapeOption {
  step?: 'start' | 'end'; // 折线图
}
```

## Area

> 用于绘制面积图

### Api

```ts
chart.area(option); // 命令式

new Chart({ area: option }); // 配置式
```

### Option

```ts
export interface AreaShapeOption extends ShapeOption {}
```

### Todo

- [ ] 支持自定义渐变范围

## Bar

> 用于绘制柱状图

### Api

```ts
chart.bar(option); // 命令式

new Chart({ bar: option }); // 配置式
```

### Option

```ts
export type AdjustType = 'stack' | 'group';

export interface AdjustOption {
  type?: AdjustType; // 默认 group  支持堆叠及分组
  marginRatio?: number; // type group 下有效 0-1 范围 默认 0.1
}

export interface BarShapeOption extends ShapeOption {
  adjust?: AdjustOption;
}
```

## Point

> 用于绘制散点图

### Api

```ts
chart.point(option); // 命令式

new Chart({ point: option }); // 配置式
```

### Option

```ts
export type SizeCallback = (...args: unknown[]) => number;

export interface PointShapeOption extends ShapeOption {
  pointSize?: number; // 点大小 默认 5
  sizeField?: string; // 设置 size 映射key 默认 ‘size’
  sizeCallback?: SizeCallback; //  设置size 回调 支持用户自定义大小 返回点大小
}
```

## Pie

> 用于绘制饼图

### Api

```ts
chart.pie(option); // 命令式

new Chart({ pie: option }); // 配置式
```

### Option

```ts
export interface PieShapeOption {
  innerRadius?: number; // 内半径 0 - 1
  outerRadius?: number; // 外半径
  startAngle?: number; // 开始角度
  endAngle?: number; // 结束角度
  label?: {
    // pie 中间文本
    text?: string; // 文本
    position?: {
      x?: number;
      y?: number;
    };
  };
  total?: number; // 指定总量
  backgroundColor?: string; // 背景颜色
  itemStyle?: {
    borderRadius?: number; //  item 圆角
    borderWidth?: number; // item间 隔宽度
  };
  innerDisc?: boolean; //内阴影盘
}
```

### Todo

- [ ] 将 angle radius 等配置归纳到 coordinate 下

## Gauge

> 用于绘制计量图

### Api

```ts
chart.gauge(option); // 命令式

new Chart({ gauge: option }); // 配置式
```

### Option

```ts
export interface GaugeShapeOption {
  innerRadius?: number; // 内半径 0 - 1
  outerRadius?: number; // 外半径
  colors: Array<[number, string]>; // 指定颜色 [百分比, color]
  label?: {
    text?: string;
    position?: {
      x?: number;
      y?: number;
    };
  };
  text?: {
    // 计量文本
    show?: boolean; // 默认展示,
    size?: number; // 字体大小 默认12
    color?: string | ((value: number) => string); // 文本颜色支持 fn 动态颜色默认 n-4
  };
}
```

### Todo

- [ ] 本身是属于 pie 的变种，只是默认了 start end angle 应该继承于 pie 实现
