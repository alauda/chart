# Chart 全量重写功能矩阵 v1

> 目标：为“全量重写内核 + 兼容旧 API/行为结果”建立功能基线，避免重写过程中遗漏能力。  
> 说明：
>
> - **Strict**：必须保证结果/行为一致，重写后不能丢
> - **Compat**：兼容入口或主要用法即可，不要求保留旧内部设计
> - **Deprecated**：可保留壳，不报错或有限兼容，并标记废弃

## 1. 图表类型

| 类别  | 功能       | 来源                                                         | 等级   | 说明         |
| ----- | ---------- | ------------------------------------------------------------ | ------ | ------------ |
| Shape | Line       | `docs/line.md`, `src/components/shape/line.ts`               | Strict | 结果必须一致 |
| Shape | Area       | `docs/area.md`, `src/components/shape/area.ts`               | Strict |              |
| Shape | Bar        | `docs/bar.md`, `src/components/shape/bar.ts`                 | Strict |              |
| Shape | Point      | `docs/point.md`, `src/components/shape/point.ts`             | Strict |              |
| Shape | Pie        | `docs/pie.md`, `src/components/shape/pie.ts`                 | Strict | d3 保留      |
| Shape | Gauge      | `docs/gauge.md`, `src/components/shape/gauge.ts`             | Strict | d3 保留      |
| Shape | BarStacked | `docs/bar-stacked.md`, `src/components/shape/bar-stacked.ts` | Strict | d3 保留      |

## 2. 数据与映射能力

| 类别 | 功能                                           | 来源                   | 等级   | 说明         |
| ---- | ---------------------------------------------- | ---------------------- | ------ | ------------ |
| Data | `data: DataItem[]` 输入格式兼容                | `src/types/options.ts` | Strict | 外部输入不变 |
| Data | `name/id/color/stack/value/values/floatValues` | `src/types/options.ts` | Strict | 必须都支持   |
| Data | 多 series                                      | 现有 shapes/stories    | Strict |              |
| Data | null 值处理                                    | line/area/point 相关   | Strict |              |
| Data | `map(name)`                                    | shape API              | Strict | 行为保留     |
| Data | time / numeric / category x 数据               | axis/scale/stories     | Strict |              |

## 3. Shape 细项

### 3.1 Line

| 功能                             | 等级   | 说明                   |
| -------------------------------- | ------ | ---------------------- |
| 基础折线                         | Strict |                        |
| 阶梯线 `step: start/end`         | Strict |                        |
| `connectNulls`                   | Strict |                        |
| `points`                         | Strict |                        |
| `width`                          | Strict |                        |
| `alpha`                          | Strict |                        |
| `map(name)`                      | Strict |                        |
| 链式 `chart.line().step().map()` | Compat | API 尽量保留，内部重做 |

### 3.2 Area

| 功能                | 等级   |
| ------------------- | ------ |
| 基础面积图          | Strict |
| 数据映射            | Strict |
| `connectNulls`      | Strict |
| 透明度/填充相关表现 | Strict |

### 3.3 Bar

| 功能         | 等级   |
| ------------ | ------ |
| 基础柱状图   | Strict |
| grouped 行为 | Strict |
| `adjust`     | Strict |

### 3.4 Point

| 功能              | 等级   |
| ----------------- | ------ |
| 基础点图          | Strict |
| `pointSize`       | Strict |
| `sizeField`       | Strict |
| `sizeCallback`    | Strict |
| active/hover 表现 | Strict |

### 3.5 Pie

| 功能                     | 等级   |
| ------------------------ | ------ |
| 内/外半径                | Strict |
| `start/end angle`        | Strict |
| `padAngle`               | Strict |
| `label text/description` | Strict |
| `labelLine`              | Strict |
| `total`                  | Strict |
| `backgroundArc`          | Strict |
| `innerDisc`              | Strict |
| `itemStyle`              | Strict |

### 3.6 Gauge

| 功能                   | 等级   |
| ---------------------- | ------ |
| `inner/outer radius`   | Strict |
| `max`                  | Strict |
| threshold colors       | Strict |
| `label/description`    | Strict |
| `text show/size/color` | Strict |

### 3.7 BarStacked

| 功能           | 等级   |
| -------------- | ------ |
| stack 数据渲染 | Strict |
| `barWidth`     | Strict |

## 4. 组件能力

| 组件       | 功能                                     | 等级   | 说明         |
| ---------- | ---------------------------------------- | ------ | ------------ |
| Title      | `show/text/formatter/custom`             | Strict |              |
| Legend     | `show/position/custom`                   | Strict |              |
| Legend     | 点击切换 series 可见性                   | Strict | 结果兼容     |
| Tooltip    | `show/hide`                              | Strict |              |
| Tooltip    | `mode: single/all`                       | Strict |              |
| Tooltip    | `showTitle`                              | Strict |              |
| Tooltip    | `popupContainer`                         | Strict |              |
| Tooltip    | formatter 系列                           | Strict |              |
| Tooltip    | `sort`                                   | Strict |              |
| Axis       | `x/y show/categories/autoSize/formatter` | Strict |              |
| Scale      | `time/min/max`                           | Strict |              |
| Coordinate | `transposed`                             | Strict |              |
| Annotation | `lineX/areaX/lineY/areaY`                | Strict |              |
| Header     | title + top legend 布局语义              | Strict | 行为一致即可 |

## 5. 交互能力

> 交互层要求“兼容结果，不兼容旧设计”。

| 功能                                  | 来源                            | 等级       | 说明                       |
| ------------------------------------- | ------------------------------- | ---------- | -------------------------- |
| hover 显示 tooltip                    | interaction docs + current impl | Strict     |                            |
| legend click 切换可见性               | current impl                    | Strict     |                            |
| `brush-x`                             | interaction docs                | Strict     | 行为保留                   |
| `element-active`                      | interaction docs                | Strict     | point/pie 等视觉激活       |
| 默认交互生效                          | `defaultInteractions`           | Strict     |                            |
| `chart.interaction(name, steps)` 入口 | `docs/interaction.md`           | Compat     | 入口可留，内部可翻译或降级 |
| `InteractionSteps` 模型               | `docs/interaction.md`           | Deprecated | 不作为新架构核心           |
| `trigger/action/callback` 旧编排      | `docs/interaction.md`           | Deprecated | 可 shim                    |

## 6. 主题能力

| 功能                 | 等级   | 说明                           |
| -------------------- | ------ | ------------------------------ |
| `light` 主题         | Strict |                                |
| `dark` 主题          | Strict |                                |
| 默认跟随系统         | Strict |                                |
| `chart.theme(...)`   | Strict |                                |
| `registerTheme(...)` | Compat | 入口兼容即可                   |
| 全局覆盖             | Compat | 可以通过新 theme registry 实现 |
| 局部覆盖             | Strict |                                |

## 7. Chart / View API

| API                                                                                                                    | 等级       | 说明                          |
| ---------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------- |
| `new Chart({...})`                                                                                                     | Strict     | 主入口必须可用                |
| `container` selector / `HTMLElement`                                                                                   | Strict     |                               |
| `width / height / autoFit / padding`                                                                                   | Strict     |                               |
| `options / data / theme / defaultInteractions`                                                                         | Strict     |                               |
| `render()`                                                                                                             | Strict     |                               |
| `destroy()`                                                                                                            | Strict     |                               |
| `changeSize` / resize 语义                                                                                             | Strict     |                               |
| `data()`                                                                                                               | Strict     |                               |
| `title()` / `legend()` / `axis()` / `scale()` / `coordinate()` / `tooltip()` / `annotation()` / `theme()` / `redraw()` | Strict     |                               |
| `getTheme()` / `getOption()`                                                                                           | Compat     | 若外部依赖较多则提升为 Strict |
| `reactive()`                                                                                                           | Deprecated | 提供 legacy shim 即可         |

## 8. Shape 命令式/链式 API

| API                                     | 等级       | 说明     |
| --------------------------------------- | ---------- | -------- |
| `chart.line()`                          | Strict     |          |
| `chart.area()`                          | Strict     |          |
| `chart.bar()`                           | Strict     |          |
| `chart.point()`                         | Strict     |          |
| `chart.pie()`                           | Strict     |          |
| `chart.gauge()`                         | Strict     |          |
| `chart.barStacked()`                    | Strict     |          |
| 返回对象支持 `map()`                    | Strict     |          |
| 返回对象支持 `step()` 等 shape 专属方法 | Strict     |          |
| 旧对象原型结构                          | Deprecated | 不必保留 |

## 9. 注册机制

> 这些能力不应反向绑架新架构；优先保证不报错和有限兼容。

| API                   | 等级       | 说明                   |
| --------------------- | ---------- | ---------------------- |
| `registerShape`       | Compat     | 可变成 shim/translator |
| `registerComponent`   | Compat     |                        |
| `registerAction`      | Deprecated | 不建议继续保留真实语义 |
| `registerInteraction` | Deprecated | 可留壳                 |
| `registerTheme`       | Compat     | 相对更值得保留         |

## 10. Reactive 能力

| 功能                         | 等级       | 说明                |
| ---------------------------- | ---------- | ------------------- |
| `chart.reactive()`           | Deprecated | 可做 legacy adapter |
| 修改 reactive 对象后更新图表 | Compat     | 尽量支持主路径      |
| deep watch 机制本身          | Deprecated | 新内核不采用        |

## 11. 文档 / 示例 / 回归基线

| 类别               | 范围                                                                              | 等级                     | 说明             |
| ------------------ | --------------------------------------------------------------------------------- | ------------------------ | ---------------- |
| Docs               | `chart/view/theme/line/area/bar/point/pie/gauge/bar-stacked/interaction/reactive` | Strict                   | 功能说明必须补齐 |
| Stories            | `line/area/bar/point/pie/gauge/stacked-bar/demo/examples/*`                       | Strict                   | 作为能力验收     |
| Regression stories | `stories/regression/*`                                                            | Strict                   | 作为视觉回归基线 |
| 旧文档结构完全不变 | Deprecated                                                                        | 文档可重写，只要能力不丢 |

## 12. 重写设计红线

| 红线                                        | 原因           |
| ------------------------------------------- | -------------- |
| 新内核不依赖旧 `View` 模型                  | 避免旧病复发   |
| 新内核不使用 prototype 动态扩展             | 降低隐式行为   |
| 新内核不以内建 global register 为核心       | 降低全局副作用 |
| 新内核不以 reactive deep watch 为主更新机制 | 保持状态流清晰 |
| 交互统一走 command/event 模型               | 提升可维护性   |
| 兼容层不得反向污染 core                     | 保证架构纯度   |
