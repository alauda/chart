# Legend

## Api

```ts
chart.legend(boolean | options); // 命令式

new Chart({ legend: options }); // 配置式
```

## Option

```ts
type LegendPosition =
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right';

interface LegendOption {
  custom?: boolean; // 预留自定义dom 用于业务覆盖
  position?: LegendPosition; // 图例位置
}
```

## Todo

- [ ] 自定义图例 custom 通过 fn 方式暴露，不支持让业务操作 dom set

- [ ] legend icon 支持根据不同图表类型展示不同样式
