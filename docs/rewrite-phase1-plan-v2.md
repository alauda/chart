# Chart 重写第一阶段实施清单 v2

> 关联文档：
>
> - `docs/rewrite-feature-matrix.md`
> - `docs/rewrite-architecture-v4.md`
>
> 目标：将 v4 架构文档拆成可以直接执行的 Step 1 / Step 2 任务序列，并补清开工前的最后一批执行细节。

## 0. 第一阶段共存策略

第一阶段期间，旧代码保留不删。

### 原则

- 新代码建在新目录中：
  - `src/core/`
  - `src/renderer/`
  - `src/shapes/`
  - `src/components/`
  - `src/interactions/`
  - `src/compat/`
- 旧代码目录在第一阶段结束前不删除：
  - `src/chart/`
  - `src/strategy/`
  - `src/reactivity/`
  - 旧 `src/components/shape/*`
- 第一阶段完成前，不切换默认 `src/index.ts` 为新入口
- 新代码优先通过独立入口或局部接线验证
- 等 Step 7 compat 跑通后，再评估默认入口切换

### 目的

- 降低新旧代码冲突风险
- 避免在架构尚未稳定时过早替换主入口
- 保证旧功能基线始终可回退参考

---

## 1. 第一阶段范围

第一阶段的目标不是完成全部重写，而是完成：

1. 新 core 类型与协议骨架
2. scheduler / engine 基础骨架
3. cartesian descriptor pipeline 最小闭环
4. uPlot cartesian renderer 最小闭环
5. legend / tooltip 最小闭环
6. hover / legend toggle 最小闭环
7. legacy `new Chart(...)` 基础兼容入口
8. polar fallback 可接入但不深度重写

### 第一阶段不做

- 新 polar runtime 完整实现
- reactive 深兼容
- register 系列完整扩展能力
- modern API 对外稳定发布
- 所有旧边缘行为的 100% 仿真

---

## 2. 第一阶段总顺序

```text
Step 1 先定类型和契约
Step 2 建 core runtime 骨架
Step 3 建 cartesian descriptor pipeline
Step 4 建 uPlot renderer 骨架
Step 5 建 components
Step 6 建 interactions
Step 7 建 compat 最小入口
Step 8 连接 polar fallback
```

顺序不能反。尤其：

- 没有 `spec/state/descriptors/commands` 之前，不进入 renderer
- 没有 scheduler/engine 之前，不进入 component/interactions 主实现
- 没有 cartesian 闭环前，不进入新 polar runtime

---

## 3. Step 1：先定义类型与契约

这一步是当前最优先的。

## 3.1 新建文件

```text
src/core/
  spec.ts
  state.ts
  descriptors.ts
  commands.ts
  events.ts
  normalize.ts

src/renderer/
  cartesian/contracts.ts
  polar/contracts.ts
```

---

## 3.2 `src/core/spec.ts`

### 要定义的内容

- `ChartSpec`
- `ThemeSpec`
- `ShapeConfig`
- `LineShapeConfig`
- `AreaShapeConfig`
- `BarShapeConfig`
- `PointShapeConfig`
- `PieShapeConfig`
- `GaugeShapeConfig`
- `BarStackedShapeConfig`
- `LegendSpec`
- `TooltipSpec`
- `AxisSpec`
- `ScaleSpec`
- `AnnotationSpec`

### 当前阶段必须明确的决策

#### 决策 1：`spec.shapes` 用数组

```ts
shapes: ShapeConfig[]
```

不使用：

```ts
Record<string, ShapeConfig>;
```

原因：

- 更适合多 shape 并存
- 更适合命令式 API 翻译为 mutation
- 更适合保序
- 更适合 descriptor pipeline

#### 决策 2：spec 不允许后端类型

`ChartSpec` 中禁止：

- `uPlot.*`
- `d3.*`

### 验收标准

- `spec.ts` 可被独立 import
- 不依赖旧 `View`
- 不依赖 uPlot/d3 类型
- 能覆盖 `rewrite-feature-matrix.md` 中的 P0 范围配置

---

## 3.3 `src/core/state.ts`

### 要定义的内容

- `ChartState`
- `NormalizedData`
- `HoverState`
- `SelectionState`
- `ResolvedColors`
- `RenderSignals`
- `RenderState`
- `TooltipValue`

### 当前阶段必须明确的决策

#### 决策 1：series visibility 状态命名统一

新核心不使用旧名 `inactivatedSet`，统一为：

```ts
hiddenSeriesKeys: Set<string>;
```

compat 层负责把旧 `inactivatedSet` 翻译过来。

#### 决策 2：颜色归 core/state

颜色解析结果存于 state：

```ts
resolvedColors: Record<string, string>;
```

#### 决策 3：RendererQueryAPI 生命周期约束

在 state/runtime 相关类型说明中写清：

- query API 仅在首次 render 完成后有效
- render 未 ready 时返回 `null`
- destroy 后返回 `null`

#### 决策 4：`RenderSignals` 放在 `state.ts`

`RenderSignals` 作为运行时状态的一部分定义于 `state.ts`，不单独拆出。

#### 决策 5：`TooltipValue` 在新 core 中重新定义

不直接复用旧 `src/types/component.ts`。

### 验收标准

- `ChartState` 能表达：
  - spec
  - normalized data
  - hidden series
  - hover
  - selection
  - render signals
  - resolved colors
- `TooltipValue` 不依赖旧类型模块

---

## 3.4 `src/core/descriptors.ts`

### 要定义的内容

- `ShapeDescriptor`
- `LineDescriptor`
- `AreaDescriptor`
- `BarDescriptor`
- `PointDescriptor`
- `PieDescriptor`
- `GaugeDescriptor`
- `BarStackedDescriptor`

### 当前阶段必须明确的决策

#### 决策：descriptor 使用 typed discriminated union

必须采用：

```ts
type ShapeDescriptor =
  | LineDescriptor
  | AreaDescriptor
  | BarDescriptor
  | PointDescriptor
  | PieDescriptor
  | GaugeDescriptor
  | BarStackedDescriptor;
```

不允许使用松散 `Record<string, unknown>` 风格作为最终设计。

### 验收标准

- renderer 可通过 `switch (descriptor.kind)` 做稳定类型收窄
- descriptor 不依赖 uPlot/d3 类型
- descriptor 足以支持 P0 cartesian renderer 输入需求
- `buildShapeDescriptors` 的输入输出签名可由 `spec.ts + state.ts + descriptors.ts` 推导出来

---

## 3.5 `src/core/commands.ts`

### 要定义的内容

- `ChartCommand`
- command payload types
- command batching 说明注释

### 当前阶段必须明确的决策

#### 决策：`REDRAW` 仍走 scheduler

`REDRAW`：

- 是高优先级 flush 请求
- 不是直接同步绕过 scheduler 的特殊口子

### 验收标准

- 命令类型稳定
- command 名称覆盖 P0 主路径：
  - `SET_SPEC`
  - `PATCH_SPEC`
  - `SET_DATA`
  - `SET_THEME`
  - `TOGGLE_SERIES`
  - `SET_HOVER`
  - `SET_SELECTION`
  - `RESIZE`
  - `REDRAW`
  - `DESTROY`

---

## 3.6 `src/core/events.ts`

### 要定义的内容

- `ChartEventType`
- 通知类事件 payload

### 当前阶段必须明确的决策

#### 决策：renderer 更新主路径由 state diff 驱动，不靠 event 订阅

也就是说：

- event 用来通知
- renderer 更新由 engine 基于 state / dirty flags 决定

### 验收标准

- 事件名称不与 command 混淆
- 文档中体现 command 与 event 的职责差异
- 明确 renderer events 是 renderer 内部桥接概念，不等同 core events

---

## 3.7 `src/core/normalize.ts`

### 要定义的内容

- `normalizeData(...)`
- normalized output 类型入口

### 当前阶段必须明确的决策

#### 决策：normalize 只做 renderer-agnostic 规范化

不做：

- uPlot alignedData
- d3 layout input

这些留给 renderer-specific transform。

### 验收标准

- 统一 `values` / `floatValues`
- 统一 name/id/stack/null 处理
- 输出不依赖 renderer

---

## 3.8 `src/renderer/*/contracts.ts`

### 要定义的内容

#### `src/renderer/cartesian/contracts.ts`

- `CartesianRendererAdapter`
- `CartesianRenderInput`
- `RendererQueryAPI`

#### `src/renderer/polar/contracts.ts`

- `PolarRendererAdapter`
- `PolarRenderInput`

### 当前阶段必须明确的决策

#### 决策：contracts 分工

- `src/core/descriptors.ts`：descriptor 类型
- `src/renderer/*/contracts.ts`：renderer adapter 接口与 renderer-specific contract

### 验收标准

- renderer contract 不回流污染 spec/descriptors
- query API 接口稳定

---

## 4. Step 2：建立 core runtime 骨架

## 4.1 新建文件

```text
src/core/
  scheduler.ts
  engine.ts
  runtime.ts
```

---

## 4.2 `src/core/scheduler.ts`

### 要实现的最小能力

- microtask batching
- command queue
- flush 调度
- 可选 rAF 节流

### 当前阶段必须明确的决策

#### 决策：scheduler 是 P0 必做，不是优化项

至少支持：

- 同一同步调用栈多个 command 合并成一次 flush
- destroy 后停止 flush
- render 未 ready 时不允许 query API 生效

### 验收标准

- 能表达 pending command queue
- 能支持一次 flush 合并多个 command
- 附带基础单测

---

## 4.3 `src/core/engine.ts`

### 要实现的最小能力

- 接收 command
- 更新 state
- 触发 normalize / descriptor pipeline / renderer 更新
- 根据 state diff 决定 component / renderer 更新

### 当前阶段必须明确的决策

#### 决策：renderer 更新由 state diff / dirty flags 驱动

不是通过 event 总线订阅驱动。

### 验收标准

- engine 不直接承担兼容逻辑
- engine 不直接操作 DOM
- engine 能驱动 renderer input rebuild
- 附带基础单测

---

## 4.4 `src/core/runtime.ts`

### 要实现的最小能力

- 组合 engine + scheduler
- 管理 start / destroy 生命周期
- 暴露最小 runtime 接口

### 验收标准

- `runtime` 是 thin wrapper
- 不承担业务协调

---

## 5. Step 3：建立 cartesian descriptor pipeline

## 5.1 新建文件

```text
src/shapes/
  line.ts
  area.ts
  bar.ts
  point.ts

src/core/
  build-descriptors.ts
```

### 目标

- `line / area / bar / point` 必须通过 descriptor pipeline 进入 renderer
- 不允许 cartesian 直接跳过 descriptor pipeline

### 当前阶段必须明确的决策

#### 决策：descriptor pipeline 输入签名固定为

```ts
buildShapeDescriptors({
  shapes: spec.shapes,
  data: normalizedData,
  colors: resolvedColors,
});
```

### 验收标准

- cartesian shapes 能生成 typed descriptors
- descriptor 不含 uPlot 类型
- descriptor 足以给 option-builder 使用

---

## 6. Step 4：建立 uPlot cartesian renderer 骨架

## 6.1 新建文件

```text
src/renderer/cartesian/
  adapter.ts
  data-transform.ts
  option-builder.ts
  tooltip-payload.ts
  events.ts
```

### 要实现的最小能力

- uPlot 实例生命周期
- descriptor -> uPlot option
- normalized data -> alignedData
- RenderSignals.hover / valuesAtCursor
- RendererQueryAPI.positionToData / hitTest

### 当前阶段必须明确的决策

#### 决策：tooltip payload 由独立函数组装

不是散在 adapter 主流程中。

### 验收标准

- renderer 不直接驱动 tooltip 组件
- renderer 只输出 render signals 和 query API

---

## 7. Step 5：建立 component runtime

## 7.1 新建文件

```text
src/components/
  legend/
    index.ts
  tooltip/
    index.ts
```

### 要实现的最小能力

- legend 消费 hidden series state
- tooltip 消费 hover render signals

### 验收标准

- component 不直接读取 renderer instance
- tooltip 只用 render signals + state

---

## 8. Step 6：建立 interaction runtime

## 8.1 新建文件

```text
src/interactions/
  hover.ts
  legend-toggle.ts
```

### 要实现的最小能力

- hover -> `SET_HOVER`
- legend toggle -> `TOGGLE_SERIES`
- 必要时通过 RendererQueryAPI 查询命中或坐标转换

### 验收标准

- interaction 不直接读 uPlot instance
- interaction 通过 runtime/core 间接用 query API

---

## 9. Step 7：compat 最小入口

## 9.1 新建文件

```text
src/compat/
  legacy-chart.ts
  legacy-translator.ts
  legacy-shape-api.ts
  legacy-registry.ts
```

### 要实现的最小能力

- `new Chart(...)`
- `chart.line()` / `chart.area()` / `chart.bar()` / `chart.point()`
- 命令式 API 翻译为 spec mutation

### 当前阶段必须明确的决策

#### 决策：命令式 API 翻译到 `spec.shapes`

例如：

- `chart.line(option)` → append/update `spec.shapes`
- `chart.bar(option)` → append/update `spec.shapes`

### 验收标准

- legacy facade 不直接走旧 View 模型
- compat 不污染 core

---

## 10. Step 8：polar fallback 接入

## 10.1 新建文件

```text
src/compat/
  legacy-polar-fallback.ts
```

### 要实现的最小能力

- 接入 `chart.pie()` / `chart.gauge()` / `chart.barStacked()`
- 提供 `LegacyPolarHostAdapter`

### 验收标准

- P0 阶段 polar strict 能力入口可用
- fallback 不进入新 core 主路径

---

## 11. 第一阶段验收标准

第一阶段完成时，至少满足：

1. `spec.ts / state.ts / descriptors.ts / commands.ts / events.ts / normalize.ts` 已落地
2. `scheduler.ts / engine.ts / runtime.ts` 已落地
3. cartesian 走 descriptor pipeline
4. uPlot renderer 最小闭环可运行
5. legend / tooltip 最小闭环可运行
6. hover / legend toggle 最小闭环可运行
7. legacy `new Chart()` + cartesian shape API 可用
8. polar fallback 可接入
9. 新代码遵守 v4 的边界约束

---

## 12. 建议的提交批次

### Batch 1

- `spec.ts`
- `state.ts`
- `descriptors.ts`
- `commands.ts`
- `events.ts`
- `normalize.ts`
- `renderer/cartesian/contracts.ts`
- `renderer/polar/contracts.ts`

### Batch 2

- `scheduler.ts`
- `engine.ts`
- `runtime.ts`

### Batch 3

- `shapes/*`
- `build-descriptors.ts`

### Batch 4

- `renderer/cartesian/*`

### Batch 5

内部建议顺序：

1. `interactions/legend-toggle`
2. `components/legend`
3. `interactions/hover`
4. `components/tooltip`

### Batch 6

- `compat/legacy-chart.ts`
- `compat/legacy-translator.ts`
- `compat/legacy-shape-api.ts`
- `compat/legacy-registry.ts`
- `compat/legacy-polar-fallback.ts`

---

## 13. 一句话执行原则

> 先定义契约，再搭 runtime；先跑通 cartesian descriptor pipeline，再接 compat；先让核心边界成立，再考虑补齐剩余能力。
