# reactive
> 为了支持配置式 options 更新，图表动态响应更新
> reactive 由 on-change 库完成
## Api

```ts
const reactive = chart.reactive();
btn.onclick = () => {
  reactive.options.tooltip = false; // 异步更新图表设置， 图表响应更新
}
```

## Todo
- [ ] 需要使用 reactive 后的变量，更新变量触发，此方式比较麻烦，期望是更新用户的 options 变量就能触发
