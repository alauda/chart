# Chart 重写架构设计 v3

> 状态：Draft  
> 分支：`rewrite/chart`  
> 本版目标：在 v2 基础上补齐实现契约与执行路径，使文档从“方向正确”升级为“可执行正确”。

## 1. 基线与目标

本次重写的基线不是当前历史重构尝试代码，而是：

- 原始公开功能
- 原始对外 API
- 原始文档承诺
- 原始 stories / regression 表现
- `docs/rewrite-feature-matrix.md`

本次重写目标：

1. 功能结果完整对齐
2. 主要 API 兼容
3. compatibility 与新内核隔离
4. 新代码按正常 lint / ts / testing 标准执行
5. 为 future modern API 保留清晰演进空间

---

## 2. 架构总览

```text
compat shell
    ↓
legacy facade / modern facade
    ↓
core kernel
    ↓
shape descriptor pipeline
    ↓
renderer runtime + component runtime + interaction runtime
    ↓
uPlot / d3
```

和 v2 相比，本版新增强调：

- shape descriptor pipeline 是单独的契约层
- scheduler 是 P0 必做核心设施
- render signals 必须足够承载 tooltip/annotation 等组件需要的完整信息

---

## 3. 工程约束

### 3.1 新架构代码

适用于：

- `src/core/*`
- `src/renderer/*`
- `src/shapes/*`
- `src/components/*`
- `src/interactions/*`
- `src/themes/*`
- `src/modern/*`

要求：

- 尽量严格的 TypeScript 约束
- 单向依赖
- 无隐式全局副作用
- 无 prototype 注入主设计
- 无 deep watch reactive 主设计
- 所有状态更新路径显式
- 关键模块可单测

### 3.2 compatibility 代码

适用于：

- `src/compat/*`

允许：

- shim
- adapter
- translator
- deprecated warning
- legacy facade

但要求：

- 不得反向污染 core
- 不得成为新主路径
- 必须可删除

---

## 4. 依赖策略

### 4.1 保留依赖

#### uPlot

保留，用作 Cartesian 渲染后端：

- line
- area
- bar
- point
- axis / scale / cursor / selection

#### d3

保留，用作 Polar / internal 渲染和几何后端：

- pie
- gauge
- barStacked
- polar layout / label / arc / path

### 4.2 其他依赖策略

除 uPlot / d3 外，其余依赖重新评估：

- 有明确价值则保留
- 有更标准或更简单方案则替换
- 只服务旧架构则删除

---

## 5. 分层与职责

## 5.1 compat shell

职责：

- 兼容旧入口
- 翻译旧配置与旧命令式 API
- 兼容旧 register / reactive / interaction 入口
- 负责 deprecated 提示

## 5.2 facade

### legacy facade

负责兼容：

- `new Chart(...)`
- `chart.line()` / `chart.bar()` / `chart.pie()` 等命令式/链式 API
- 旧 `chart.interaction(...)`

### modern facade

负责未来新 API 出口。

> modern 不是 P0 交付重点，只是架构保留层。

## 5.3 core kernel

职责：

- spec / state / data model
- command / event 协议
- scheduler 驱动下的更新编排
- renderer / component / interaction 协调
- color resolution state

## 5.4 shape descriptor pipeline

职责：

- 将 spec 中的图形配置解释为 renderer-agnostic 的 shape descriptor
- 作为 shape 与 renderer 之间的翻译契约层

这层是 v3 新增强调的关键层。

## 5.5 renderer runtime

职责：

- 消费 normalized data + shape descriptors + theme/state
- 生成具体后端输入
- 管理渲染生命周期
- 输出 render signals

## 5.6 component runtime

职责：

- legend
- tooltip
- title
- annotation
- header 等外围 UI

## 5.7 interaction runtime

职责：

- 接收 renderer / DOM 事件
- 转换为 command
- 驱动 state 更新

---

## 6. 关键契约

## 6.1 spec / shapes / descriptor / renderer 的边界

这是最重要的执行契约。

### spec

位置：`src/core/spec.ts`

职责：

- 描述图表公开配置
- 描述图表应该呈现的业务语义
- 不包含渲染后端细节

### spec 的强约束

> `ChartSpec` 中不允许直接出现 `uPlot.*` 或 `d3.*` 类型引用。

这意味着当前旧架构中的：

- `ShapeOption extends uPlot.Series`

在新架构中明确废弃。

### shapes

位置：`src/shapes/*`

职责：

- 定义图形语义规则
- 将 spec 中的 shape 配置解释为中间描述
- 不直接操作 uPlot / d3 实例

### descriptor

位置建议：

- `src/shapes/contracts.ts`
- 或 `src/core/descriptors.ts`

descriptor 是 renderer-agnostic 的中间描述，示例：

```ts
interface ShapeDescriptor {
  kind: 'line' | 'area' | 'bar' | 'point' | 'pie' | 'gauge' | 'barStacked';
  series: Array<{
    key: string;
    mapKey?: string;
    style?: Record<string, unknown>;
    behavior?: Record<string, unknown>;
  }>;
  geometry?: Record<string, unknown>;
}
```

### renderer

职责：

- 消费 descriptor
- 将 descriptor 翻译成具体后端结构
- 例如：
  - uPlot series config
  - aligned data
  - d3 layout input

### 一句话定义

> spec 是业务配置，shape 是图形语义，descriptor 是中间契约，renderer 是后端适配执行层。

---

## 6.2 shapes 分离策略（短期 / 中期 / 长期）

为了和当前代码现实对齐，本次不假设 shapes 能一步抽纯。

### 短期（P0）

- 不强制所有 shape 完全脱离 legacy host
- cartesian 新实现优先围绕 descriptor pipeline 建立
- polar 允许通过 compat fallback 暂时桥接旧 shape 语义

### 中期（P1）

- 抽出 shape 中纯粹的：
  - series 计算规则
  - geometry 计算规则
  - option merge 规则
- 将这些逻辑沉淀为可被 descriptor pipeline 复用的纯模块

### 长期（P2）

- shape 成为真正独立的 rule objects
- 不依赖 `View` / legacy host / renderer instance

### 原则

> 文档中的 shape 目标形态是长期目标；P0 阶段允许存在过渡实现，但过渡实现必须被 compat 隔离，而不是进入新 core。

---

## 6.3 normalize 与 renderer-specific transform 的边界

### normalize

位置：`src/core/normalize.ts`

职责：

- 统一原始 data 输入格式
- 统一 `values` / `floatValues`
- 统一 series identity（name/id）
- 处理 stack / null / x/y 字段规范化
- 输出 renderer-agnostic normalized data

### renderer transform

位置：

- `src/renderer/cartesian/data-transform.ts`
- `src/renderer/polar/layout.ts`

职责：

- 将 normalized data 转成具体后端输入
- 例如 alignedData / series input / polar layout input

### 固定数据流

```text
raw data
  -> normalize (core)
  -> normalized data
  -> shape descriptor pipeline
  -> renderer-specific transform
  -> renderer input
```

---

## 6.4 RenderSignals 契约

renderer 不直接驱动 component，renderer 通过 render signals 向 core 输出足够完整的 runtime 信息。

### 最小契约（v3 补强版）

```ts
interface RenderSignals {
  plotBBox?: DOMRect;
  hover?: {
    anchor?: Element | HTMLElement;
    anchorRect?: DOMRect;
    boundRect?: DOMRect;
    position?: { x: number; y: number };
    title?: string | number | Date;
    values?: TooltipValue[];
    seriesKey?: string;
    datumIndex?: number;
  };
  valuesAtCursor?: Array<{
    seriesKey: string;
    value: number | null;
    formattedValue?: string;
  }>;
  selection?: {
    xStart?: number | string | Date;
    xEnd?: number | string | Date;
  };
}
```

### 说明

- tooltip 所需 payload 不只包含几何位置，也必须包含可直接渲染的数据
- annotation / cursor / scale 相关能力未来也可以基于 plotBBox / valuesAtCursor 扩展

### 约束

- component 不直接读 renderer 实例
- tooltip 不直接绑定 uPlot/d3 internals
- 所有展示信息经 core state / render signals 统一暴露

---

## 6.5 color 管理归属

当前旧代码里 color manager 靠近 chart/view 层。新架构中必须明确：

> color palette resolution 属于 core/state 的职责，不属于 renderer 私有职责。

原因：

- legend 需要颜色
- tooltip 需要颜色
- renderer 需要颜色
- compatibility 可能也要读取颜色

### 约定

- theme 提供 palette tokens
- core/state 负责 series color resolution
- renderer 只消费 resolved color

---

## 7. Command / Event 协议

## 7.1 ChartCommand 草案

```ts
type ChartCommand =
  | { type: 'SET_SPEC'; spec: ChartSpec }
  | { type: 'PATCH_SPEC'; patch: Partial<ChartSpec> }
  | { type: 'SET_DATA'; data: RawChartData }
  | { type: 'SET_THEME'; theme: ThemeSpec }
  | { type: 'TOGGLE_SERIES'; seriesKey: string }
  | { type: 'SET_HOVER'; payload: HoverState | null }
  | { type: 'SET_SELECTION'; payload: SelectionState | null }
  | { type: 'RESIZE'; width: number; height: number }
  | { type: 'REDRAW' }
  | { type: 'DESTROY' };
```

## 7.2 Command batching 策略

这是 v3 新增的明确约定。

### 默认策略

- command 在同一同步调用栈中，按 **microtask** 合并
- 多个 command 默认只触发一次 render flush

例如：

```ts
chart.data(newData);
chart.theme('dark');
chart.redraw();
```

不会默认触发三次完整 render。

### scheduler 规则

1. 普通 command：进入 scheduler 队列
2. scheduler：microtask 合并
3. flush：统一驱动 engine -> renderer update
4. 实际绘制可再由 scheduler 选择是否进 rAF

### REDRAW 的语义

`REDRAW` 不是直接绕过 scheduler 的立即绘制，而是：

- 标记一次高优先级 flush 请求
- 仍然走 scheduler
- 但跳过不必要的等待或低优先级合并

一句话：

> scheduler 是唯一合法的 command-to-render flush 通道。

## 7.3 Event 规则

- command 改状态
- event 做通知

例如：

- `RENDER_COMPLETED`
- `SELECTION_CHANGED`
- `LEGEND_TOGGLED`

---

## 8. core 与 scheduler

建议目录：

```text
src/core/
  spec.ts
  state.ts
  commands.ts
  events.ts
  normalize.ts
  engine.ts
  scheduler.ts
  runtime.ts
```

### 去掉 `src/core/chart.ts`

v2 中 `chart.ts` 与 facade/engine 命名容易重叠。v3 改为：

- 不建议保留 `src/core/chart.ts`
- 若需要一个内核启动封装，使用 `runtime.ts`

### engine.ts

职责：

- 接收 command
- 更新 state
- 调用 normalize / descriptor pipeline / renderer / components

### scheduler.ts

职责：

- command batching
- microtask merge
- render flush 时机控制
- rAF 级节流与合并

### runtime.ts

职责：

- 作为 engine + scheduler 的 thin wrapper
- 负责启动/销毁生命周期
- 不承担业务协调

---

## 9. renderer 设计

建议目录：

```text
src/renderer/
  cartesian/
    adapter.ts
    data-transform.ts
    option-builder.ts
    events.ts
    contracts.ts
  polar/
    adapter.ts
    layout.ts
    events.ts
    contracts.ts
  shared/
    color.ts
    geometry.ts
    layout.ts
```

### 删除 `renderer/shared/tooltip.ts`

原因：

- tooltip 是 component，不是 renderer 子系统
- tooltip 数据应该经 RenderSignals 传出
- renderer/shared 只保留纯工具：
  - color
  - geometry
  - layout

---

## 10. compat 设计

建议目录：

```text
src/compat/
  legacy-chart.ts
  legacy-translator.ts
  legacy-shape-api.ts
  legacy-registry.ts
  legacy-reactive.ts
  legacy-polar-fallback.ts
  deprecations.ts
```

## 10.1 registerShape compat 路径

旧系统中 `registerShape` 通过 prototype patch 生效：

```ts
View.prototype[key] = function (options) { ... }
```

新系统中不再允许这种副作用成为主设计。

### 新路径

```text
registerShape(name, ctor)
  -> compat/legacy-registry
  -> wrap as legacy shape descriptor factory
  -> legacy-shape-api translator
  -> legacy facade 消费
```

### 原则

- 兼容 register 的是 API 入口
- 不兼容旧的 prototype monkey-patch 机制
- legacy ctor 只能在 compat 中被包装和消费

## 10.2 polar fallback adapter 最小接口

P0 阶段 polar fallback 必须真实可用，因此 compat 层需要向 legacy polar shape 提供 View-like adapter。

建议最小接口：

```ts
interface LegacyPolarHostAdapter {
  container: HTMLElement;
  chartContainer: HTMLElement;
  inactivatedSet: Set<string>;
  getData(): DataItem[];
  getOption(): unknown;
  getTheme(): ThemeTokens;
  on(event: string, handler: (...args: unknown[]) => void): void;
  emit(event: string, payload?: unknown): void;
}
```

### 约束

- 该 adapter 仅存在于 compat fallback
- 不进入新 core 主路径
- 不作为新 polar runtime 的正式接口

---

## 11. P0 策略

### P0 新实现范围

- core kernel 基础骨架
- scheduler
- cartesian renderer（uPlot）
- line / area / bar / point 最小闭环
- legend / tooltip 最小闭环
- hover / legend toggle 最小闭环
- legacy `new Chart()` 基础兼容入口

### P0 fallback 范围

- pie / gauge / barStacked 通过 `legacy-polar-fallback` 兜底

### P0 关键要求

- strict 功能不能因为 P0 未完成 polar runtime 而失效
- scheduler 必须进入 P0，不是可选优化
- descriptor pipeline 必须进入 P0，否则 shape / renderer 边界会失控

---

## 12. legacy reactive

`chart.reactive()` 继续归类为 Deprecated，但需要可用。

### 兼容原则

- 不报错
- 主路径可用
- 不复刻旧 deep watch 架构地位

### 实现原则

- compat proxy
- 将常见写操作映射为 command：
  - `PATCH_SPEC`
  - `SET_DATA`
  - `SET_THEME`

---

## 13. 实施顺序

### Step 1

先定义：

- `ChartSpec`
- `ChartState`
- `NormalizedData`
- `ShapeDescriptor`
- `ChartCommand`
- `RenderSignals`

### Step 2

实现 scheduler + engine + runtime

### Step 3

实现 cartesian renderer + option-builder + data-transform

### Step 4

实现 legend / tooltip component runtime

### Step 5

实现 interaction runtime（hover / legend toggle）

### Step 6

实现 compat：

- legacy facade
- registerShape compat path
- polar fallback adapter

### Step 7

再逐步替换 polar runtime

---

## 14. 成功标准

1. spec 不再包含 uPlot/d3 类型
2. shape 与 renderer 之间通过 descriptor 契约解耦
3. scheduler 成为唯一合法 render flush 通道
4. tooltip / annotation 不再直接依赖 renderer 内部实例
5. P0 阶段 strict 功能不因重写失效
6. compat 未污染 core

---

## 15. 关联文档

- `docs/rewrite-feature-matrix.md`
- `docs/rewrite-architecture-v2.md`
