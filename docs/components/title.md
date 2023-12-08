# Title

## Api

```ts
chart.title(boolean | options); // 命令式

new Chart({ title: options }); // 配置式
```

## Api

```ts
export interface TitleOption {
  text?: string; // 标题文本
  custom?: boolean; // 预留自定义dom 用于业务覆盖
  formatter?: string | ((text: string) => string); // 格式化
}
```

## Todo

- [ ] 自定义图例 custom 通过 fn 方式暴露，不支持让业务操作 dom set

- [ ] 支持样式调整，position color 等
