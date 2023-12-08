# Tooltip

> 工具提示

## Api

```ts
chart.tooltip(boolean | options); // 命令式

new Chart({ tooltip: options }); // 配置式
```

## Option

```ts
export interface TooltipOpt {
  showTitle?: boolean; // 展示标题
  popupContainer?: HTMLElement; // tooltip 渲染父节点 默认 body
  titleFormatter?: string | ((title: string, values: TooltipValue[]) => string); // 标题格式化
  nameFormatter?: string | ((name: string) => string); // item name (图例)格式化
  valueFormatter?: string | ((value: TooltipValue) => string); // item value 格式化
  itemFormatter?: (value: TooltipValue[]) => string | TooltipValue[] | Element; // item 格式化
  sort?: (a: TooltipValue, b: TooltipValue) => number; // 排序规则
}
```

## Todo

- [ ] item icon 支持根据类型不同展示不同 icon 和 legend 对应
