# Chart

> 用于提供创建 svg、自适应图表大小等配置, 继承于 View，有着 View 的 api
>
> 职责：创建 容器 计算大小、resize 重新计算、初始化默认 interaction

## 调研点

> 插件化 最小打包、用户自定义
>
> options reactive next tick
>
> web component 优劣
>
> 组件通讯 event ? view 桥梁？

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
  // 绘制的 DOM 可以是 DOM select  也可以是 DOM 实例
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

---

**会议纪要**

1. 使用 web component 实现

2. 合并 changeData data data 内置 nextTick （vue nextTick 可否直接使用）

3. event-emitter 可使用第三方 async event 或者 web component 原生的

---

### 结论

- 插件化：不使用 prototype 实现

  - compnent 全局 register web-component 全局 defined
  - interaction 和 Chart 实例绑定 如 vue.use(plugin)

- reactive： chart 默认手动更新， data 支持 reactive 方式，内置 nextTick

##### nextTick

> 数据变更 => watcher push 事件队列 => 下一次事件触发 => 清空队列

##### web-component

> ~~IE 不兼容 有 [polyfills](https://github.com/webcomponents/polyfills) 但一些样式 css 无效 不考虑 ie~~

1. 已经成熟

2. 避免二次包装

- 开发替换成本 替换成功差不太多
- 场景 避免二次包装
- 技术难度 参数只支持 string
- 开源影响 react vue 都有在支持 web component

### 讨论点

nextTick

- 多次 setData setTitle 进入 nextTick 队列，每次更新只更新引用，最后 render

web component attr string property 传入参数只支持 string

1. attr text-offset 将 option 拍平以 xx-xx-xx 格式定义 （array 还是有问题）

2. 框架内 自定义属性 例如 vue 的 :data="data" （提供序列化方式）

3. 不使用 web component （在调研一段事件看是否有好的方式解决）

evemt emmit

- 用第三方插件，事件是全局发送还是当前实例？（个人当前实例 无需 多个实例之间的通讯）
- uuid 自增即可

插件化

- component 还是以全局方式注册 无需 servie
- interactions 插件形式 例如 vue.use(plugin) 绑定在当前实例下

组件通讯

- 通过 event 通讯 （散落在各个组件内不好维护）
- 通过 view 拿到所有组件实例，通过 view 做桥梁组件之间去通讯 （反模式）
