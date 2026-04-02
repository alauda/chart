# Chart 重写架构设计 v2

> 状态：Draft  
> 分支：`rewrite/chart`  
> 本版目标：吸收 v1 review，补清关键边界定义、command 协议、通信路径、P0 polar 策略，并与 `docs/rewrite-feature-matrix.md` 对齐。

## 1. 背景

本次工作不是继续沿用旧 `View + strategy + runtime register + reactive` 模型做结构性重构，而是直接进行**全量重写**。

重写的真实基线是：

- 原始公开功能
- 原始对外 API
- 原始文档承诺
- 原始 stories / regression 表现
- `docs/rewrite-feature-matrix.md`

当前分支中的历史重构尝试代码不作为新架构基线，只可作为参考材料。

---

## 2. 重写目标

### 2.1 必须达成

1. **功能结果完整对齐**
   - 以 `docs/rewrite-feature-matrix.md` 为准
2. **主要 API 兼容**
   - 不要求现有使用方代码整体迁移
3. **建立新的清晰内核架构**
   - 分层明确
   - 依赖单向
   - 模块职责单一
4. **工程标准恢复正常**
   - 新代码按正常 lint / ts / testing 标准执行
5. **compatibility 被隔离**
   - 旧 API 兼容壳不能污染新内核

### 2.2 不做

1. 不兼容旧内部实现结构
2. 不保留旧 `View` 作为新系统中心
3. 不将旧 interaction / register / reactive 模型继续作为新主路径
4. 不因兼容要求降低新内核设计质量

---

## 3. 工程约束原则

### 3.1 新代码默认按标准工程实践执行

适用于：

- `src/core/*`
- `src/renderer/*`
- `src/shapes/*`
- `src/components/*`
- `src/interactions/*`
- `src/themes/*`
- `src/modern/*`

要求：

- 明确类型边界
- 尽量严格的 TypeScript 约束
- 单向依赖
- 无隐式全局副作用
- 无 prototype 注入主设计
- 无 deep watch reactive 主设计
- 所有状态更新路径显式
- 核心模块必须可单测

### 3.2 compatibility 层允许有限妥协

适用于：

- `src/compat/*`

允许：

- shim
- translator
- adapter
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
- axis / scale / cursor / select 相关能力

#### d3

保留，用作 Polar / internal 渲染和几何后端：

- pie
- gauge
- barStacked
- label / arc / layout / path 相关能力

### 4.2 其他依赖策略

除 uPlot / d3 外，其余依赖重新评估：

- 有明确价值则保留
- 有更简单替代则替换
- 只服务旧架构则删除

原则：不因为旧实现曾依赖就自动继承。

---

## 5. 架构总览

```text
compat shell
    ↓
legacy facade / modern facade
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
- 翻译旧配置/旧调用方式到新 spec/command
- 为旧 register / reactive / interaction 入口提供 shim
- 发出 deprecated 提示

### 5.2 facade

分两类：

- **legacy facade**：兼容 `new Chart(...)` 与旧命令式/链式 API
- **modern facade**：未来新 API 的承接层

### 5.3 core kernel

职责：

- spec/state/data model
- command / event 协议
- state update
- render coordination
- component / interaction 编排

### 5.4 renderer runtime

职责：

- 生成具体后端输入
- 管理渲染生命周期
- 输出统一 renderer signals

### 5.5 component runtime

职责：

- legend
- tooltip
- title
- annotation
- header 等外围 UI

### 5.6 interaction runtime

职责：

- 接收 renderer / DOM 事件
- 转换为 command
- 驱动 state 更新

---

## 6. 关键边界定义

## 6.1 spec / shapes / renderer 的边界

这是本次重写必须先定义清楚的第一组边界。

### spec

位置：`src/core/spec.ts`

职责：

- 定义图表公开配置结构
- 描述图表“应该长什么样”
- 是纯配置模型

特点：

- 无执行逻辑
- 无渲染后端细节
- 无 DOM / uPlot / d3 类型

### shapes

位置：`src/shapes/*`

职责：

- 定义图形语义规则
- 存放 shape 级别的计算规则
- 描述“某种图形如何解释 normalized data”

例如：

- line 的 step / connectNulls / points 规则
- pie 的 label / guideline / arc 级别规则
- gauge 的 threshold / label 规则

特点：

- 不直接依赖旧 `View`
- 不直接管理渲染实例
- 不是 spec 本身
- 不是 renderer 本身

一句话：

> spec 是配置描述，shape 是图形语义规则，renderer 是后端适配执行层。

### renderer

位置：`src/renderer/*`

职责：

- 将 spec + normalized data + shape rules 转换成具体渲染后端输入
- 管理具体渲染实例生命周期
- 输出统一 renderer signals

特点：

- renderer 不定义业务配置结构
- renderer 不拥有 shape 语义
- renderer 只负责“怎么画到某个后端上”

---

## 6.2 normalize.ts 与 data-transform.ts 的边界

这是第二组必须清晰的边界。

### normalize.ts

位置：`src/core/normalize.ts`

职责：

- 处理原始输入兼容
- 统一 `values` / `floatValues`
- 统一 series identity（name/id）
- 处理 stack / null / x/y 字段规范化
- 产出 **renderer-agnostic normalized data**

它解决的问题是：

> “业务输入到底是什么格式，系统内部统一成什么模型。”

### renderer/\*/data-transform.ts

位置：

- `src/renderer/cartesian/data-transform.ts`
- `src/renderer/polar/layout.ts`（极坐标场景）

职责：

- 将 normalized data 转换成具体渲染后端结构
- 例如：
  - uPlot alignedData
  - uPlot series input
  - d3 polar layout input

它解决的问题是：

> “某个渲染后端需要什么输入格式。”

### 数据流固定为

```text
raw data
  -> normalize (core)
  -> normalized data
  -> renderer-specific transform
  -> renderer input
```

红线：

- 业务输入规范化不能下沉到 renderer
- renderer-specific 结构不能回流污染 core model

---

## 6.3 component 与 renderer 的通信路径

这是 tooltip / legend / annotation 等实现时最容易被破坏的边界。

### 硬规则

> component 不直接读 renderer 内部实例，不直接依赖 uPlot/d3 internals。

### 正确路径

```text
renderer runtime event
  -> interaction translator
  -> command
  -> core state update
  -> component reads state / render signals
```

### renderer 向 core 提供的不是“组件回调”，而是 render signals

建议定义：

```ts
interface RenderSignals {
  hover?: {
    anchorRect?: DOMRect;
    position?: { x: number; y: number };
    seriesKey?: string;
    datumIndex?: number;
  };
  selection?: {
    xStart?: number | string | Date;
    xEnd?: number | string | Date;
  };
}
```

这些 signals 由 renderer 输出给 core，core 存成 runtime-visible state，component 只消费 state。

### Tooltip 实现约束

tooltip 组件只允许依赖：

- hover state
- render signals 中的位置/anchor 信息
- normalized data / formatted payload

不允许：

- 直接拿 uPlot 实例计算 DOM 位置
- 直接监听 renderer 内部事件绕过 core

---

## 7. Command / Event 协议草案

command/event 是 interaction runtime 的基础，不再停留在口号层。

## 7.1 ChartCommand（最小草案）

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

## 7.2 谁可以发 command

- legacy facade
- modern facade
- interaction runtime
- component runtime（仅用户动作触发）

## 7.3 Event 的作用

event 不负责改状态，event 负责通知。

例如：

- `THEME_CHANGED`
- `RENDER_COMPLETED`
- `SELECTION_CHANGED`
- `LEGEND_TOGGLED`

原则：

- **command 改状态**
- **event 做通知**

---

## 8. 模块分层设计

## 8.1 core

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

### engine.ts 与 scheduler.ts 的边界

#### engine.ts

负责：

- 接收 command
- 更新 state
- 协调 normalize / renderer / components / interactions

#### scheduler.ts

负责：

- 合并多次更新
- 管理 requestAnimationFrame / microtask 级别的渲染调度
- 避免重复 render

一句话：

> engine 决定“做什么”，scheduler 决定“什么时候真正渲染”。

## 8.2 renderer

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

负责：

- line/area/bar/point
- axis/scale/cursor/select 相关后端能力
- 产生统一 render signals

### polar renderer（d3）

负责：

- pie/gauge/barStacked
- polar layout/path/label
- 产生统一 render signals

## 8.3 shapes

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

原则：

- shape 规则是 domain 级语义规则
- renderer 只消费 shape rule，不拥有 shape 语义

## 8.4 components

```text
src/components/
  legend/
  tooltip/
  title/
  annotation/
  axis/
  header/
```

## 8.5 interactions

```text
src/interactions/
  hover.ts
  legend-toggle.ts
  brush-x.ts
  element-active.ts
  select.ts
```

交互模型固定为：

```text
Renderer Event / DOM Event
  -> Interaction Translator
  -> ChartCommand
  -> Core Engine
  -> State Update
  -> Re-render / Component Refresh
```

## 8.6 compat

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

## 8.7 modern

```text
src/modern/
  create-chart.ts
  public-api.ts
```

### modern 的定位

modern 不是 P0 交付重点，而是未来 API 出口。

P0 阶段：

- 可以保留目录设计
- 但不要求真正公开稳定 modern API

也就是说：

> modern 存在是为了未来 API 演进，不是当前 P0 范围的主要交付目标。

---

## 9. 功能等级对齐原则

若 `rewrite-architecture-v2.md` 与 `rewrite-feature-matrix.md` 冲突，以 **功能矩阵** 为准。

### 特别对齐说明

- `chart.line()`：Strict
- `map()` / `step()` 等 shape 专属方法：**Strict**
- 它们的旧内部实现模型：不保留

即：

> 调用结果和行为等级是 Strict，内部实现兼容性不是 Strict。

---

## 10. P0 阶段策略

## 10.1 P0 范围

### 新实现进入 P0 的内容

- core kernel 基础骨架
- cartesian renderer（uPlot）
- line / area / bar / point 最小闭环
- legend / tooltip 最小闭环
- hover / legend toggle 最小闭环
- legacy `new Chart()` 基础兼容入口

### 不在 P0 深度重写范围内的内容

- pie / gauge / barStacked 的新 polar runtime 实现
- reactive 深兼容
- register 系列完整扩展语义
- modern public API 对外正式稳定

## 10.2 P0 的 polar fallback 策略

这是 v2 明确补充的策略。

`chart.pie()` / `chart.gauge()` / `chart.barStacked()` 在功能矩阵中仍然是 Strict，因此 P0 不允许入口不可用。

### P0 方案

P0 阶段采用：

> **cartesian 重写 + polar legacy fallback**

即：

- cartesian 图表走新 core + 新 cartesian renderer
- polar 图表暂时通过 compat 层桥接 legacy polar runtime
- 等 P1/P2 再逐步替换为新 polar runtime

### P0 要求

- polar 入口必须可用
- 结果必须与当前能力对齐
- fallback 逻辑必须隔离在 `src/compat/legacy-polar-fallback.ts`
- 不允许把 legacy polar 逻辑直接混进新 core 或新 renderer

---

## 11. legacy reactive 策略

`chart.reactive()` 被归类为 Deprecated，但不能在兼容层直接消失。

### 兼容目标

- 不报错
- 主路径可用
- 不要求完全复刻旧 deep watch 语义

### 实现原则

`legacy-reactive.ts`：

- 提供 compat proxy
- 将常见修改映射为显式 command：
  - `PATCH_SPEC`
  - `SET_DATA`
  - `SET_THEME`
- 不让 deep watch 成为新内核更新基础

一句话：

> 兼容 reactive 的入口，不继承 reactive 的旧架构地位。

---

## 12. 错误处理策略（最小版）

## 12.1 compat 翻译失败

- 抛出结构化错误
- dev 模式打印明确 warning
- 不允许 silently fail

## 12.2 renderer 渲染失败

- 图表进入 error state
- 不让整个页面异常扩散
- 保留销毁与重建能力

## 12.3 deprecated 能力

- dev 模式 warning
- prod 默认静默
- 文档中明确标记迁移方向

---

## 13. 实施顺序建议

### Step 1

先定模型与协议：

- `ChartSpec`
- `ChartState`
- `NormalizedData`
- `ChartCommand`
- `RenderSignals`

### Step 2

实现 core engine + scheduler

### Step 3

实现 cartesian renderer adapter

### Step 4

实现 component runtime（legend / tooltip）

### Step 5

实现 interaction runtime（hover / legend toggle）

### Step 6

实现 compat 最小入口 + polar fallback

### Step 7

再进入新 polar runtime 替换

---

## 14. 成功标准

1. 分层清楚
2. command/event 协议清楚
3. component 与 renderer 不再直接耦合
4. P0 阶段 strict 功能没有因为重写被破坏
5. 新代码能按正常 lint / ts / test 标准推进
6. compatibility 没有污染 core

---

## 15. 关联文档

- `docs/rewrite-feature-matrix.md`
- `docs/rewrite-architecture-v1.md`
