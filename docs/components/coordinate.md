# Coordinate
> 坐标系

## Api

```ts
chart.coordinate(option) // 命令式

new Chart({ coordinate: options }) // 配置式
```

## Option

```ts
export interface CoordinateOpt {
  transposed?: boolean; //  x y 轴置换
}
```

## Todo
- [ ] 支持多种坐标系类型 例如 极坐标系(pie) polar 极坐标系的配置例如 startAngel endAngel等