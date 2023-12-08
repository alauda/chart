# Theme

> - 提供 `light dark` 主题，默认跟随系统
> - 支持全局注册及覆盖样式
> - chart 内支持覆盖
> - 默认跟随系统主题

## API

```ts
// 全局注册主题
registerTheme('custom',{
  //...
})
// 设置主题
chart.theme('custom')

// 全局覆盖部分配置
registerTheme('dark',{
  //...
})
// 覆盖当前 chart 主题配置
chart.theme('dark', {//...})
```
