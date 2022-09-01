# Chart

> 用于提供创建 svg、自适应图表大小等配置, 继承于 View，有着 View 的 api
>
> 职责：创建 容器 计算大小、resize 重新计算、初始化默认 interaction

## 调研点

### dayjs 插件化、 immutable

> 插件化 `prototype` 方式实现
>
> immutable 会 clone() 实现， mutable 重写 set 等方法

```ts
dayjs.extend = (plugin, option) => {
 plugin(option, Dayjs, dayjs)
 return dayjs
}

// badMutable
export default (o, c) => {
 const proto = c.rtotype
 proto.set = function (string, int) {
  return this.$set(string, int)
 }
}

// index.js
class Dayjs {
set(string, int) {
  return this.clone().$set(string, int)
}
```

#### 结论

- 插件化：不使用 prototype 实现，大概：component interaction 都是插件化，都 register 方式注册使用，component interaction 内置 register 实现
- immutable： chart 默认手动更新 如多次 setData(data) 内部会 nextTick 生效， data 支持 reactive 方式 this.data = data 会自动更新，

### nextTick

> 数据变更 => watcher push 事件队列 => 下一次事件触发 => 清空队列

### web-component

> ~~IE 不兼容 有 [polyfills](https://github.com/webcomponents/polyfills) 但一些样式 css 无效 不考虑 ie~~

1. 已经成熟

2. 避免二次包装

## 结构

```
alauda-chart
├─ src
│  ├─ chart
│  │  ├─ index.ts
│  │  └─ view.ts
│  ├─ components // 组件 title legend tooltip shape....
|  │  ├─ annotation // 辅助组件 line text 阀值线标尺等
|  │  ├─ axis // 坐标
|  │  ├─ base // abstract component 抽象类
|  │  ├─ index // 负责组件的注册、删除、获取等
|  │  ├─ title
|  │  ├─ legend // 图例
|  │  ├─ shape // 图形
      └─ tooltip // 工具提示
│  ├─ interactions // 交互类
|  │  ├─ index.ts
│  ├─ themme // 主题
│  ├─ utils // 工具
│  │  ├─ constant.ts // 常量
│  │  ├─ util.ts // 工具
│  ├─ event-emitter.ts // 事件绑定类 async event!
│  ├─ index.ts // 入口文件-- 导出chart相关 及 注册（组件、事件等）
└─
```

## Core

> 组件、interaction 等都通过 register 方式加载
>
> 默认会注册一些组件

1. title

2. legend

3. axis

4. shape // line area bar pie point 注册方式

5. tooltip

## Api

#### 创建图表对象

> web-component 方式

```ts
<chart
  option={option}
  data={data}
>
  <view option={option}>
    <line></line>
    <area></area>
  </view>
  <title></title>
  <legend></legend>
  <axis></axis>
  <tooltip></tooltip>
</chart>
```

#### Option

```ts
interface ChartOption {
  // 绘制的 DOM 可以是 DOM selector  也可以是 DOM 实例
  container: string | HTMLElement;
  // 图表宽高度 不设置默认根据父容器高度自适应
  width?: number;
  height?: number;
  // 图表内边距 上 右 下 左
  padding?: number[];
  // 默认交互 ['tooltip', 'legend-filter', 'legend-active']
  defaultInteractions?: string[];
  // 图表组件等相关的配置。同时支持配置式 和 声明式
  options: Options;
}

interface Options {
  axis?: Axis;
  legend: Legend;
  scale: Scale;
  // ....
}
```

## 必要的

- 默认 Interactions 实例 (tooltip, legend-active, legend-filter)
- 插件化

## Todo

1. 支持 reactive plugin
2. svg canvas 切换 模式切换 【拍平两边的兼容】// 第三方、识别适配器
3. 动画
4. nodejs 中使用 d3 node 默认不支持 DOM 需要 jsdom 之类的创建 dom
5. ~~nextTick 默认先支持手动 render 后面在支持实时更新~~

##

**会议纪要**

1. 使用 web component 实现

2. 合并 changeData data data 内置 nextTick （vue nextTick 可否直接使用）

3. event-emitter 可使用第三方 async event 或者 web component 原生的
