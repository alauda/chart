# Chart 重写架构设计 v1

> 状态：Draft  
> 分支：`rewrite/chart`  
> 目标：在保持现有图表能力和主要 API 兼容的前提下，重写 chart 内核架构，使代码结构、工程约束、可维护性和可测试性整体上一个等级。

## 1. 背景

当前仓库已经明确存在以下问题：

- `View` 为中心的中枢对象承载了过多职责
- `uplot-strategy` 兼有渲染、事件桥接、tooltip、数据整理、布局等多种职责
- 运行时默认注册、prototype 扩展、deep reactive 等机制加重了隐式行为
- 代码结构对新增功能、修复问题和长期演进不友好

因此，本次工作不再沿用旧架构做持续重构，而是直接进行**全量重写**。

但重写的基线不是“当前重构尝试代码”，而是：

- 原始公开功能
- 原始对外 API
- 原始文档承诺
- 原始 stories / regression 表现
- 当前已经整理出的功能矩阵文档：`docs/rewrite-feature-matrix.md`

---

## 2. 重写目标

### 2.1 必须达成

1. **保留现有功能能力**
   - 以 `docs/rewrite-feature-matrix.md` 为准
2. **保持主要使用方式兼容**
   - 不期望现有业务代码需要大面积改动
3. **建立新的清晰内核架构**
   - 分层明确
   - 依赖方向单向
   - 模块职责单一
4. **工程标准提升**
   - lint、ts、测试、目录结构按正常标准执行
5. **为未来新 API 和旧 API 废弃路径留出空间**

### 2.2 明确不做

1. 不继续兼容旧内部实现模型
2. 不保留旧的架构中心对象作为新系统核心
3. 不让 compatibility 逻辑污染新内核
4. 不因为兼容而保留不合理的核心设计

---

## 3. 工程约束原则

## 3.1 新代码默认按标准工程实践约束

适用于：

- `src/core/*`
- `src/renderer/*`
- `src/components/*`
- `src/interactions/*`
- `src/themes/*`
- `src/modern/*`
- `src/shapes/*`
- `src/compat/*` 之外的新模块

要求：

- 明确类型边界
- 尽量使用 TypeScript 严格约束
- import 依赖方向清晰
- 不使用隐式全局副作用作为主设计
- 不使用 prototype 动态注入作为主设计
- 不使用 deep watch reactive 作为核心更新模式
- 所有状态更新路径应显式可追踪
- 关键模块必须可单测

## 3.2 compatibility 层允许有限妥协

适用于：

- `src/compat/*`

允许：

- shim
- adapter
- legacy translator
- deprecated warning
- 兼容旧 API 的薄包装

但要求：

- 不得反向污染 core
- 不得让兼容逻辑成为新主路径
- 兼容层必须边界清晰、可删除

---

## 4. 依赖策略

## 4.1 保留依赖

### uPlot

保留，作为 Cartesian 图表渲染后端：

- line
- area
- bar
- point
- axis / scale 相关能力

### d3

保留，作为 Polar / internal 图表渲染和几何计算后端：

- pie
- gauge
- barStacked
- polar 布局/路径/label 相关能力

## 4.2 其他依赖原则

除 uPlot / d3 外，其他依赖一律重新评估：

- 保留：确有明确价值且简化实现
- 替换：若存在更简单、更标准或更可维护的方案
- 删除：若只是旧架构历史遗留

重写时不因为“旧实现用过”就默认继续保留。

---

## 5. 新架构总览

新的系统分为 5 层：

```text
compat shell
    ↓
modern api / legacy api facade
    ↓
core kernel
    ↓
renderer runtime + component runtime + interaction runtime
    ↓
uPlot / d3
```

### 5.1 compat shell

职责：

- 承接旧 API 入口
- 翻译旧配置到新 spec
- 对旧扩展机制做 shim / adapter
- 负责 deprecated 提示

不负责：

- 核心状态管理
- 渲染逻辑
- 组件调度
- 交互主流程

### 5.2 modern api / legacy api facade

职责：

- 对外暴露两类入口：
  - legacy-compatible API
  - future-facing modern API
- 都统一落到同一个 core kernel

### 5.3 core kernel

职责：

- 统一 spec 模型
- 统一 state 模型
- 数据标准化
- command/event 协议
- 渲染调度
- 组件/交互编排

### 5.4 renderer runtime

职责：

- 将 state/spec 转成具体渲染后端的输入
- 管理渲染实例生命周期
- 向 interaction runtime 输出统一事件

### 5.5 component runtime

职责：

- title
- legend
- tooltip
- annotation
- 其他外围 UI 组件

### 5.6 interaction runtime

职责：

- 处理 renderer/DOM 输入事件
- 翻译为 command
- 驱动 state 更新

---

## 6. 模块分层设计

## 6.1 core

建议目录：

```text
src/core/
  chart.ts
  spec.ts
  state.ts
  commands.ts
  events.ts
  normalize.ts
  engine.ts
  scheduler.ts
```

职责说明：

- `spec.ts`：公开配置模型与内部统一 spec
- `state.ts`：运行时状态模型
- `commands.ts`：交互和外部 API 触发的显式命令
- `events.ts`：领域事件定义
- `normalize.ts`：原始 data -> normalized data
- `engine.ts`：核心编排器
- `scheduler.ts`：更新/重绘调度器
- `chart.ts`：顶层 facade，不承担细节

原则：

- 无 DOM
- 无 uPlot/d3 直接依赖（尽量）
- 可测试
- 单向依赖

## 6.2 renderer

建议目录：

```text
src/renderer/
  cartesian/
    adapter.ts
    data-transform.ts
    option-builder.ts
    events.ts
  polar/
    adapter.ts
    layout.ts
    events.ts
  shared/
    color.ts
    geometry.ts
    tooltip.ts
```

### cartesian renderer（uPlot）

职责：

- line/area/bar/point 对接 uPlot
- 处理 series、scale、axis、cursor、select 等后端能力
- 输出统一 hover / selection / click 等 runtime event

### polar renderer（d3）

职责：

- pie/gauge/barStacked 的布局、路径和事件
- 输出统一 runtime event

原则：

- renderer 是渲染适配层，不是业务中心
- renderer 不直接负责 legend / tooltip 业务状态
- renderer 不直接持有 chart 的真实业务语义

## 6.3 shapes

建议目录：

```text
src/shapes/
  line.ts
  area.ts
  bar.ts
  point.ts
  pie.ts
  gauge.ts
  bar-stacked.ts
  contracts.ts
```

职责：

- 存放 shape 级别的绘制规则、series 构造规则、几何规则
- 接收标准化输入，而不是依赖旧 `View`

原则：

- 复用旧 shape 中真正有价值的视觉/几何规则
- 不复用对 `View`/全局注册/旧交互机制的耦合

## 6.4 components

建议目录：

```text
src/components/
  legend/
  tooltip/
  title/
  annotation/
  axis/
  header/
```

职责：

- 基于 state/render output 显示外围 UI
- 响应 command/event

原则：

- 不直接深入 renderer 内部实例
- 不自己维护真实业务状态
- 只反映 core state

## 6.5 interactions

建议目录：

```text
src/interactions/
  hover.ts
  legend-toggle.ts
  brush-x.ts
  element-active.ts
  select.ts
```

交互主模型：

```text
Renderer Event / DOM Event
  -> Interaction Translator
  -> Command
  -> Core Engine
  -> State Update
  -> Re-render / Component Refresh
```

原则：

- 不采用旧的 `trigger/action/callback` 作为主架构
- 若要兼容旧 interaction API，只能在 compat 中翻译

## 6.6 compat

建议目录：

```text
src/compat/
  legacy-chart.ts
  legacy-translator.ts
  legacy-shape-api.ts
  legacy-registry.ts
  legacy-reactive.ts
  deprecations.ts
```

职责：

- 兼容旧 `new Chart(...)`
- 兼容旧 shape 命令式/链式调用
- 兼容旧 register API
- 兼容旧 reactive API（仅限壳能力）

原则：

- 薄层
- 可删除
- 不主导架构

## 6.7 modern

建议目录：

```text
src/modern/
  create-chart.ts
  public-api.ts
```

职责：

- 暴露未来清晰、稳定、现代化的 API
- 与 legacy facade 并存

---

## 7. 兼容策略

## 7.1 兼容目标

本次兼容优先级为：

1. **结果兼容**
2. **主要 API 兼容**
3. **入口不报错**
4. **旧内部设计不兼容**

## 7.2 兼容分类

### Strict

必须结果一致：

- 图表类型能力
- 组件能力
- 主题能力
- 主要命令式 API
- 主要交互结果
- 文档和 stories 表达的核心能力

### Compat

入口兼容即可：

- 某些链式调用形式
- `registerShape/registerComponent/registerTheme`
- `chart.interaction(name, steps)`

### Deprecated

保留壳，不作为新架构核心：

- `reactive()`
- `registerInteraction`
- `registerAction`
- `InteractionSteps` 旧模型
- deep reactive 行为模式

---

## 8. 代码质量与工程规范

## 8.1 TypeScript

新架构代码默认采用严格模式设计思路：

- 明确返回类型
- 避免 `any`
- 避免 `@ts-ignore`
- 尽量减少 `unknown` 向外扩散
- 边界处做必要 narrowing

## 8.2 ESLint / 格式化

新架构部分要求：

- lint 默认按正常标准通过
- 不为历史包袱放宽新模块约束
- 旧仓库遗留规则可仅限于 legacy/compat 区域

## 8.3 测试策略

至少包括：

- core unit tests
- renderer adapter integration tests
- key shape tests
- legacy facade compatibility tests
- story smoke
- regression/visual baseline

## 8.4 文档策略

文档分三类：

- 架构设计文档
- 功能矩阵文档
- 对外 API / migration 文档

---

## 9. 第一阶段实施范围

第一阶段只做最小但完整的新骨架验证：

### P0

- core kernel 基础骨架
- cartesian renderer（uPlot）
- line / area / bar / point 最小闭环
- legend / tooltip 最小闭环
- hover / legend toggle 最小闭环
- legacy `new Chart()` 基础兼容入口
- `docs/rewrite-feature-matrix.md` 中相关 strict 能力的最小实现

### 暂不进入第一阶段

- pie / gauge / barStacked 深度迁移
- reactive 深兼容
- register 系列完整扩展能力
- 未来 modern API 完整公开

---

## 10. 实施顺序建议

### Step 1

先定模型：

- `ChartSpec`
- `ChartState`
- `NormalizedData`
- command/event contract

### Step 2

实现 cartesian renderer adapter：

- uPlot 接入
- line/area/bar/point 跑通

### Step 3

实现 component runtime：

- legend
- tooltip

### Step 4

实现 interaction runtime：

- hover
- legend toggle

### Step 5

实现 compat shell 最小入口：

- legacy chart facade
- 基础 shape API translator

### Step 6

再扩展 polar runtime 和更复杂兼容能力

---

## 11. 成功标准

重写阶段的判断标准不是“代码更现代”，而是：

1. 新架构分层清楚
2. 新代码 lint / type / test 可以按正常标准推进
3. compatibility 不污染 core
4. 功能矩阵中的 strict 能力没有遗漏
5. 后续新增功能或修 bug 不再需要穿透式改动多个层级

---

## 12. 关联文档

- `docs/rewrite-feature-matrix.md`
- `docs/refactor-readonly-analysis.md`（如后续需要再带入当前分支）
- `docs/visual-regression-plan.md`（如后续需要再带入当前分支）
