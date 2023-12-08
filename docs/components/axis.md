# Axis

> 坐标轴

## Api

```ts
chart.axis('x' | 'y', option); // 命令式

new Chart({ axis: { x: options, y: options } }); // 配置式
```

## Option

```ts
export interface AxisOpt {
  autoSize?: boolean; // 默认 true  y 坐标轴生效，根据 label 长度自动偏移图表
  formatter?: string | ((value: string | number) => string); // 格式化
}
```
