import { isBoolean, isObject, set } from 'lodash';

import { BaseComponent } from '../components/base.js';
import {
  AnnotationOption,
  AxisOption,
  Data,
  LegendOption,
  Options,
  ShapeOption,
  Size,
  Theme,
  ThemeOptions,
  TitleOption,
  TooltipOption,
  ViewOption,
} from '../index.js';
import { ViewStrategy } from '../strategy/abstract.js';
import {
  UPlotViewStrategy,
  ViewStrategyManager,
  InternalViewStrategy,
} from '../strategy/index.js';
import { getTheme } from '../theme/index.js';

export class View {
  /** 所有的组件 controllers。 */
  components: BaseComponent[] = [];

  // 配置信息存储
  protected options: Options = {};

  // container
  container: HTMLElement;

  /** 主题配置，存储当前主题配置。 */
  protected themeObject: ThemeOptions;

  private strategyManage: ViewStrategyManager;

  private strategy: ViewStrategy[];

  size: Size = { width: 0, height: 0 };

  constructor(props: ViewOption) {
    const { width, height, ele, options } = props;
    this.container = ele;
    this.options = options;
    this.size = { ...this.size, width, height };
    this.init();
  }

  init() {
    this.initViewStrategy();
    this.initComponent();
    this.render();
  }

  render(size?: Size) {
    if (size) {
      this.size = size;
    }
    this.strategy.forEach(item => {
      item.render();
    });
  }

  interaction(name?: string) {
    console.log(name);
    // createInteraction..
  }

  /**
   * 基于注册组件初始化
   */
  private initComponent() {
    this.components = this.strategyManage.getComponent();
  }

  /**
   * 初始化策略 uPlot internal
   */
  private initViewStrategy() {
    this.strategyManage = new ViewStrategyManager();
    const uPlot = new UPlotViewStrategy(this);
    const internal = new InternalViewStrategy(this);
    this.strategyManage.add(uPlot);
    this.strategyManage.add(internal);
    this.strategy = this.strategyManage.getAllStrategy();
  }

  /**
   * 设置主题。
   * @param theme 主题名或者主题配置
   * @returns View
   */
  theme(theme?: string | Theme): View {
    this.themeObject = isObject(theme)
      ? getTheme(theme.type, theme)
      : getTheme(theme);
    return this;
  }

  /**
   * 获取主题配置。
   * @returns themeObject
   */
  getTheme(): ThemeOptions {
    return this.themeObject;
  }

  /**
   * 获取 view options 配置
   */
  getOption() {
    return this.options;
  }

  /**
   * 装载数据源。
   *
   * ```ts
   * chart.data([]);
   * ```
   *
   * @param data 数据源。
   * @returns View
   */
  data(data: Data): View {
    set(this.options, 'data', data);
    return this;
  }

  // -------------- Component ---------------//
  title(titleOption: TitleOption): View {
    set(this.options, 'title', titleOption);
    return this;
  }

  legend(legendOption: boolean | LegendOption): View {
    set(this.options, 'legend', legendOption);
    return this;
  }

  /**
   * 对特定的某条坐标轴进行配置。
   *
   * ```ts
   * view.axis('x', false); // 不展示 'x' 坐标轴
   * // 将 'x' 字段对应的坐标轴的标题隐藏
   * view.axis('x', {
   *   //...
   * });
   * ```
   * @param field 坐标轴 x y
   * @param axisOption 坐标轴配置
   */
  axis(field: string, axisOption: AxisOption): View;
  axis(field: string | boolean, axisOption?: AxisOption): View {
    if (isBoolean(field)) {
      set(this.options, ['axis'], field);
    } else {
      set(this.options, ['axis', field], axisOption);
    }
    return this;
  }

  tooltip(tooltipOption: TooltipOption): View {
    set(this.options, 'tooltip', tooltipOption);
    return this;
  }

  /**
   * 图形配置
   *
   * ```ts
   * view.shape('line'); // line area point bar pie gauge
   * view.shape('area', {
   *   //...
   * });
   * ```
   * @param field 坐标轴 x y
   * @param axisOption 坐标轴配置
   */
  shape(field: string, shapeOption: ShapeOption): View {
    set(this.options, ['shape', field], shapeOption);
    return this;
  }

  /**
   * 辅助标记配置
   */
  annotation(annotationOption: AnnotationOption) {
    set(this.options, 'annotation', annotationOption);
    return this;
  }

  /**
   * 生命周期：销毁，完全无法使用。
   */
  destroy() {
    // ...
  }
}
