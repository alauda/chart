# interaction

> 图表相关的交互都属于 interaction， 例如 tooltip hover legend active 等
> 默认 生效 tooltip, legend-active

## 内置 interaction

- tooltip： 鼠标 hover chart 展示提示信息
- legend-active： 鼠标点击图例激活图例项激活
- brush-x： 鼠标框选 x 轴
- element-active：鼠标移入元素 激活 例如：pie point 移入后有激活效果

## Api

```ts
chart.interaction('xxx', steps); // 命令式
```

## Option

```ts
export interface InteractionSteps {
  start?: InteractionStep[]; //  交互开始

  end?: InteractionStep[]; // 交互结束
}

export interface InteractionStep {
  trigger: string | TriggerType; // 触发事件，支持 view，chart 的各种事件

  action: string | ActionType; // action 名称 (组件:动作)

  callback?: (context: unknown) => void; // 回调函数，action 执行后执行
}
```

## 配置

> 交互由 trigger 和 action 组合而成

```ts
// 设置 x 轴框选交互
chart.interaction('brush-x', {
  start: [
    {
      trigger: ChartEvent.PLOT_MOUSEDOWN, // plot 鼠标按下 触发
      action: ActionType.BRUSH_X_START // 执行 brush x start 动作
    },
  ],
  end: [
    {
      trigger: ChartEvent.PLOT_MOUSEUP, // plot 鼠标抬起 触发
      action: ActionType.BRUSH_X_END  // 执行 brush x end 动作
      callback: e => {}, // 触发end 后执行回调
    },
  ],
})
```

### Todo

- [ ] 增加更多内置交互，legend-highlight element-selected 等
