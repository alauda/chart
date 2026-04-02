# Chart 重写架构设计 v4

> 状态：Draft  
> 分支：`rewrite/chart`  
> 本版目标：在 v3 基础上补清第一批类型与接口实现会遇到的歧义，使 Step 1 可以直接开始定义类型与边界。

## 1. 基线与目标

本次重写的基线不是当前历史重构尝试代码，而是：

- 原始公开功能
- 原始对外 API
- 原始文档承诺
- 原始 stories / regression 表现
- `docs/rewrite-feature-matrix.md`

目标：

1. 功能结果完整对齐
2. 主要 API 兼容
3. compatibility 与 core 隔离
4. 新代码按正常 lint / ts / testing 标准执行
5. 为 future modern API 留出清晰演进空间

---

## 2. 架构总览

```text
compat shell
    ↓
legacy facade / modern facade
    ↓
core kernel
    ↓
descriptor pipeline
    ↓
renderer runtime + component runtime + interaction runtime
    ↓
uPlot / d3
```

其中 descriptor pipeline、scheduler、render signals、renderer query API 是本次重写从“方向正确”走向“可执行正确”的关键基础设施。

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

> modern 不是 P0 交付重点。

## 5.3 core kernel

职责：

- spec / state / data model
- color resolution state
- command / event 协议
- scheduler 驱动下的更新编排
- renderer / component / interaction 协调

## 5.4 descriptor pipeline

职责：

- 将 spec 中的 shape 配置解释为 renderer-agnostic 的 shape descriptors
- 作为 shape 与 renderer 之间的翻译契约层

## 5.5 renderer runtime

职责：

- 消费 normalized data + descriptors + theme/state
- 生成具体后端输入
- 管理渲染生命周期
- 输出 RenderSignals
- 暴露 RendererQueryAPI

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
- 使用 RendererQueryAPI 做必要查询
- 转换为 command
- 驱动 state 更新

---

## 6. 关键契约

## 6.1 spec / shapes / descriptor / renderer 边界

### spec

位置：`src/core/spec.ts`

职责：

- 描述公开配置
- 描述业务语义
- 不包含渲染后端细节

### 强约束

> `ChartSpec` 中不允许直接出现 `uPlot.*` 或 `d3.*` 类型引用。

因此旧架构里的：

- `ShapeOption extends uPlot.Series`

在新架构中明确废弃。

### shapes

位置：`src/shapes/*`

职责：

- 定义图形语义规则
- 将 spec 中的 shape 配置解释为 descriptor 所需信息
- 不直接操作 uPlot / d3 实例

### descriptor

推荐位置：`src/core/descriptors.ts`

> v4 明确：descriptor 是系统级中间契约，建议放在 `src/core/descriptors.ts`，而不是散落在 shapes 或 renderer 下。

### renderer

职责：

- 消费 descriptor
- 将 descriptor 翻译为具体后端结构
- 管理后端实例生命周期

一句话：

> spec 是业务配置，shapes 是图形语义，descriptor 是中间契约，renderer 是后端适配执行层。

---

## 6.2 ShapeDescriptor 设计原则

v3 中的 `ShapeDescriptor` 示例偏松散，v4 明确补充：

> **最终 ShapeDescriptor 必须是 typed discriminated union，而不是 `Record<string, unknown>` 风格的松散结构。**

### 示例（简化）

```ts
type ShapeDescriptor =
  | LineDescriptor
  | AreaDescriptor
  | BarDescriptor
  | PointDescriptor
  | PieDescriptor
  | GaugeDescriptor
  | BarStackedDescriptor;

interface LineDescriptor {
  kind: 'line';
  series: Array<{
    key: string;
    mapKey?: string;
    connectNulls?: boolean;
    step?: 'start' | 'end';
    width?: number;
    alpha?: number;
    color?: string;
    points?: boolean;
  }>;
}
```

### 原则

- `switch(descriptor.kind)` 后应能得到稳定类型收窄
- renderer 不应依赖大量 runtime assertion 去猜 descriptor 字段
- descriptor 是“renderer-agnostic but strongly typed”

---

## 6.3 descriptor pipeline 输入签名

v4 明确 descriptor pipeline 的输入不是单一来源，而是：

- shape 相关 spec
- normalized data
- resolved colors

### 推荐签名

```ts
const descriptors = buildShapeDescriptors({
  shapes: spec.shapes,
  data: normalizedData,
  colors: resolvedColors,
});
```

### 各输入来源

- `spec.shapes`：图形配置语义
- `normalizedData`：series 实际结构
- `resolvedColors`：core/state 中已分配好的颜色

### 数据流（v4 明确版）

```text
raw data
  -> normalize (core)
  -> normalized data
  -> resolve colors (core/state)
  -> build descriptors
  -> renderer-specific transform
  -> renderer input
```

---

## 6.4 shapes 分离策略（P0 / P1 / P2）

### P0

- **cartesian shapes（line / area / bar / point）必须通过 descriptor pipeline 实现**
- **polar shapes（pie / gauge / barStacked）不要求进入 descriptor pipeline，暂时通过 compat fallback 运行**

这是 v4 对 v3 的进一步澄清，避免“短期不强制”被误解为 cartesian 也可以跳过 descriptor pipeline。

### P1

- 抽出 shape 中纯粹的：
  - series 计算规则
  - geometry 计算规则
  - option merge 规则
- 提升 shape 规则的复用度

### P2

- shape 成为真正独立的 rule objects
- 不依赖 `View` / legacy host / renderer instance

---

## 6.5 normalize 与 renderer-specific transform 的边界

### normalize

位置：`src/core/normalize.ts`

职责：

- 统一原始 data 输入格式
- 统一 `values` / `floatValues`
- 统一 series identity（name/id）
- 处理 stack / null / x/y 字段规范化
- 输出 renderer-agnostic normalized data

### renderer-specific transform

位置：

- `src/renderer/cartesian/data-transform.ts`
- `src/renderer/polar/layout.ts`

职责：

- 将 normalized data + descriptors 转成具体后端输入
- 例如 alignedData / series config / polar layout input

---

## 6.6 RenderSignals 契约

renderer 不直接驱动 component，renderer 通过 RenderSignals 向 core 输出足够完整的 runtime 信息。

### 定义（v4 保留 pragmatic choice）

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

这里保留 `hover.title` / `hover.values` 这类 tooltip-ready payload，是一个 **pragmatic choice**：

- 优点：减少 core 自己重组 tooltip 数据的复杂度
- 风险：renderer 承担一部分 hover payload 组装责任

### 约束

- 这部分逻辑必须隔离成独立 payload builder
- 不能散在 renderer adapter 主流程中
- 删除的是 `renderer/shared/tooltip.ts` 这种旧的 tooltip 组件/DOM 设计，不是否定 renderer 侧的纯 payload 组装函数

推荐路径：

- `src/renderer/cartesian/tooltip-payload.ts`
- `src/renderer/polar/tooltip-payload.ts`

---

## 6.7 RendererQueryAPI

interaction runtime 不直接拿 renderer 实例，但需要主动查询命中测试与坐标变换能力。

### 契约

```ts
interface RendererQueryAPI {
  positionToData(
    px: number,
    py: number,
  ): { x: number | string | Date; y?: number } | null;

  hitTest(
    px: number,
    py: number,
  ): { seriesKey: string; datumIndex: number } | null;
}
```

### 用途

- brush-x：DOM 坐标 -> 数据坐标
- element-active：命中测试
- hover：renderer 查询辅助

### 约束

- interaction 只能通过 core/runtime 间接使用 query API
- 不允许 interaction 直接读 uPlot/d3 instance

---

## 6.8 color 管理归属

> color palette resolution 属于 core/state 职责，不属于 renderer 私有职责。

原因：

- legend 需要颜色
- tooltip 需要颜色
- renderer 需要颜色
- compatibility 也可能需要颜色

约定：

- theme 提供 palette tokens
- core/state 负责 resolvedColors
- descriptor pipeline 消费 resolvedColors
- renderer 只消费 resolved color

---

## 7. Command / Event / Scheduler

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

## 7.2 batching 策略

### 默认规则

- 同一同步调用栈中的多个 command，在 **microtask** 级别合并
- 默认只触发一次 render flush

### REDRAW 语义

- `REDRAW` 仍走 scheduler
- 但代表高优先级 flush 请求

### scheduler 是 P0 必做

scheduler 不是优化项，而是 P0 核心设施。

---

## 8. core 目录与职责

建议目录：

```text
src/core/
  spec.ts
  state.ts
  commands.ts
  events.ts
  normalize.ts
  descriptors.ts
  engine.ts
  scheduler.ts
  runtime.ts
```

### 说明

- `descriptors.ts`：系统级中间契约（ShapeDescriptor 等）
- `engine.ts`：处理 command、更新 state、协调 descriptor pipeline / renderer / components
- `scheduler.ts`：batching / flush / rAF 节流
- `runtime.ts`：engine + scheduler 的 thin wrapper

> v4 继续明确：不建议保留 `src/core/chart.ts`。

---

## 9. renderer 目录与职责

建议目录：

```text
src/renderer/
  cartesian/
    adapter.ts
    data-transform.ts
    option-builder.ts
    tooltip-payload.ts
    events.ts
    contracts.ts
  polar/
    adapter.ts
    layout.ts
    tooltip-payload.ts
    events.ts
    contracts.ts
  shared/
    color.ts
    geometry.ts
    layout.ts
```

### contracts 边界

- `src/core/descriptors.ts`：定义 ShapeDescriptor
- `src/renderer/*/contracts.ts`：定义 renderer adapter 接口、query API 实现契约、renderer-specific types

### `geometry.ts` vs `layout.ts`

- `geometry.ts`：几何计算（点、线、bbox、arc 等）
- `layout.ts`：布局计算（padding、anchor、placement、区域布局）

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

```text
registerShape(name, ctor)
  -> compat/legacy-registry
  -> wrap as legacy shape descriptor factory
  -> legacy-shape-api translator
  -> legacy facade 消费
```

原则：

- 兼容 register 的是 API 入口
- 不兼容旧 prototype monkey-patch 机制

## 10.2 polar fallback adapter

P0 阶段 polar fallback 必须真实可用，因此 compat 层需要向 legacy polar shape 提供 View-like adapter。

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

约束：

- 该 adapter 仅存在于 compat fallback
- 不进入新 core 主路径

---

## 11. P0 策略

### P0 新实现范围

- core kernel 基础骨架
- scheduler
- cartesian descriptor pipeline
- cartesian renderer（uPlot）
- line / area / bar / point 最小闭环
- legend / tooltip 最小闭环
- hover / legend toggle 最小闭环
- legacy `new Chart()` 基础兼容入口

### P0 fallback 范围

- pie / gauge / barStacked 通过 `legacy-polar-fallback` 兜底

### P0 关键要求

- cartesian 必须走 descriptor pipeline
- polar 不要求进入 descriptor pipeline
- strict 功能不能因为 P0 未完成 polar runtime 而失效
- scheduler 必须进入 P0

---

## 12. legacy reactive

`chart.reactive()` 继续归类为 Deprecated，但需要可用。

实现原则：

- compat proxy
- 映射常见写操作到 command：
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
- `resolvedColors`
- `ShapeDescriptor`
- `ChartCommand`
- `RenderSignals`
- `RendererQueryAPI`

### Step 2

实现 scheduler + engine + runtime

### Step 3

实现 cartesian descriptor pipeline + cartesian renderer

### Step 4

实现 legend / tooltip component runtime

### Step 5

实现 interaction runtime（hover / legend toggle / query API usage）

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
2. ShapeDescriptor 为 typed union，而非松散对象
3. cartesian shapes 通过 descriptor pipeline 与 renderer 解耦
4. scheduler 成为唯一合法 render flush 通道
5. interaction 不直接依赖 renderer instance，而通过 RendererQueryAPI 间接查询
6. tooltip / annotation 不再直接依赖 renderer 内部实例
7. P0 阶段 strict 功能不因重写失效
8. compat 未污染 core

---

## 15. 关联文档

- `docs/rewrite-feature-matrix.md`
- `docs/rewrite-architecture-v3.md`
