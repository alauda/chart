# Scale

> 度量 比例尺 用于定义域范围类型等

## Api

```ts
chart.scale('x' | 'y', option); // 命令式

new Chart({ scale: { x: options, y: options } }); // 配置式
```

## Option

```ts
export interface ScaleOption {
  time?: boolean; // true
  min?: number; // 最小值
  max?: number; // 最大值
}
```

## Todo

- [ ] tickCount 指定 tick 个数
