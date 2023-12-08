import { isBoolean, isObject, merge, set, cloneDeep } from 'lodash';

import { Annotation } from '../components/annotation.js';
import { BaseComponent } from '../components/base.js';
import { Coordinate } from '../components/coordinate.js';
import { Legend } from '../components/legend.js';
import { Scale } from '../components/scale.js';
import { PolarShape, Shape, ShapeCtor } from '../components/shape/index.js';
import { getInteraction } from '../interaction/index.js';
import Interaction from '../interaction/interaction.js';
import { reactive, Reactive } from '../reactivity/index.js';
import { ViewStrategy } from '../strategy/abstract.js';
import {
  UPlotViewStrategy,
  ViewStrategyManager,
  InternalViewStrategy,
} from '../strategy/index.js';
import { getTheme } from '../theme/index.js';
import {
  AxisOption,
  ChartEvent,
  CoordinateOption,
  Data,
  InteractionSteps,
  LegendOption,
  Options,
  ScaleOption,
  ShapeOptions,
  Size,
  Theme,
  ThemeOptions,
  TitleOption,
  TooltipOption,
  ViewOption,
} from '../types/index.js';
import { ShapeType } from '../utils/component.js';
import { getChartColor } from '../utils/index.js';

import EventEmitter from './event-emitter.js';

export class View extends EventEmitter {
  /** 所有的组件  */
  components: Map<string, BaseComponent> = new Map();

  /** 图形组件 */
  shapeComponents: Map<string, Shape | PolarShape> = new Map();

  // 配置信息存储
  protected options: Options = {};

  readonly reactivity: Reactive;

  interactions: Map<string, Interaction> = new Map();

  // container
  container: HTMLElement;

  chartContainer: HTMLElement;

  coordinateInstance: Coordinate;

  /** 主题配置，存储当前主题配置。 */
  protected themeObject: ThemeOptions;

  strategyManage: ViewStrategyManager;

  private strategy: ViewStrategy[];

  private mediaQuery: MediaQueryList;

  systemThemeType: 'light' | 'dark' = 'light';

  size: Size = { width: 0, height: 0 };

  defaultInteractions: string[];

  // 判断是否是 element active  [point]
  get isElementAction() {
    return !!this.shapeComponents.get('point');
  }

  get hideTooltip() {
    return this.options.tooltip === false;
  }

  fixedSize = {
    width: 0,
    height: 0,
  };

  constructor(props: ViewOption) {
    super();
    const {
      width,
      height,
      chartEle,
      ele,
      options,
      data,
      theme,
      chartOption,
      padding,
      defaultInteractions,
    } = props;
    this.reactivity = reactive(chartOption, this);
    this.chartContainer = chartEle;
    this.container = ele;
    if (options) {
      this.options = { ...options, padding };
    }
    data && this.data(data);
    this.defaultInteractions = defaultInteractions;
    this.size = { ...this.size, width, height };
    this.fixedSize = {
      width,
      height,
    };
    this.initTheme(theme);
    this.init();
  }

  init() {
    this.initViewStrategy();
    this.initComponent();
  }

  reactive() {
    return this.reactivity.reactiveObject;
  }

  render(size?: Size) {
    if (size) {
      this.size = size;
    }
    [...this.components.values()].forEach(c => c.render());
    this.strategy.forEach(item => {
      item.render();
    });
    // TODO: 去除依赖 shape 判断 is point
    this.initDefaultInteractions(this.defaultInteractions);
  }

  interaction(name: string, steps?: InteractionSteps) {
    const interactionStep = getInteraction(name);
    if ((steps || interactionStep) && !this.interactions.get(name)) {
      const step =
        steps && interactionStep
          ? merge(interactionStep, steps)
          : steps || interactionStep;
      const interaction = new Interaction(this, cloneDeep(step));
      interaction.init();
      this.interactions.set(name, interaction);
    }
  }

  private initDefaultInteractions(interactions: string[]) {
    for (const name of interactions) {
      if (name) {
        this.interaction(name);
      }
    }
  }

  /**
   * 基于注册组件初始化
   */
  private initComponent() {
    this.createCoordinate();
    this.strategyManage.getComponent().forEach(c => {
      this.components.set(c.name, c);
    });
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
   *
   * @param theme 主题
   * 不设置默认根据系统切换 light dark
   */
  private initTheme(theme: Theme) {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemThemeType = this.mediaQuery.matches ? 'dark' : 'light';
    if (!theme || theme?.type === 'system') {
      this.bindThemeListener();
    }
    this.theme(theme || this.systemThemeType);
  }

  private bindThemeListener() {
    this.mediaQuery.addEventListener('change', this.systemChangeTheme);
  }

  private unbindThemeListener() {
    this.mediaQuery.removeEventListener('change', this.systemChangeTheme);
  }

  private readonly systemChangeTheme = (e: MediaQueryListEvent) => {
    const theme = e.matches ? 'dark' : 'light';
    this.theme(theme);
  };

  /**
   * 设置主题。
   * @param theme 主题名或者主题配置
   * @returns View
   */
  theme(theme?: string | Theme): View {
    this.themeObject = isObject(theme)
      ? getTheme(theme.type, theme)
      : getTheme(theme);
    this.emit(ChartEvent.THEME_CHANGE);
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
   * chart.data();
   * ```
   *
   * @param data 数据源。
   * @returns View
   */
  data(data: Data): View {
    data.forEach((d, index) => {
      if (!d.color) {
        d.color = getChartColor(index);
      }
    });
    set(this.options, 'data', data);
    this.emit(ChartEvent.DATA_CHANGE, data);
    return this;
  }

  getData() {
    return this.options.data || [];
  }

  // -------------- Component ---------------//
  title(titleOption: TitleOption): View {
    set(this.options, 'title', titleOption);
    return this;
  }

  legend(legendOption: boolean | LegendOption): Legend {
    set(this.options, 'legend', legendOption);
    return this.components.get('legend') as Legend;
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

  /**
   * 对x y 度量进行配置。
   * ```
   * @param field 度量 x y
   * @param scaleOption 度量配置
   */
  scale(field: string, axisOption: ScaleOption): Scale {
    if (isBoolean(field)) {
      set(this.options, ['scale'], field);
    } else {
      set(this.options, ['scale', field], axisOption);
    }
    return this.components.get('scale') as Scale;
  }

  setScale(field: 'x' | 'y', limits: { min?: number; max?: number }) {
    const scale = this.components.get('scale') as Scale;
    scale.setScale(field, limits);
  }

  /**
   * 创建坐标系
   * @private
   */
  private createCoordinate() {
    this.coordinateInstance = new Coordinate(this);
  }

  /**
   * 坐标系配置。
   *
   * ```ts
   * // 直角坐标系，并进行转置变换
   * chart.coordinate().transpose();
   * ```
   * @returns
   */
  coordinate(option?: CoordinateOption): Coordinate {
    set(this.options, 'coordinate', option);
    // 更新 coordinate 配置
    // this.coordinateInstance.update(option);
    return this.coordinateInstance;
  }

  getCoordinate() {
    return this.coordinateInstance;
  }

  tooltip(tooltipOption: TooltipOption): View {
    set(this.options, 'tooltip', tooltipOption);
    return this;
  }

  /**
   * 辅助标记配置
   */
  annotation(): Annotation {
    return this.components.get('annotation') as Annotation;
  }

  // 命令式设置 option
  setOption(name: string | string[], option: unknown) {
    set(this.options, name, option);
    // console.log(this.options)
    return this;
  }

  redraw() {
    this.emit(ChartEvent.HOOKS_REDRAW);
  }

  /**
   * 生命周期：销毁，完全无法使用。
   */
  destroy() {
    // ...
    this.chartContainer.innerHTML = '';
    this.options = {};
    this.reactivity.unsubscribe();
    [...this.components.values()].forEach(c => c.destroy());
    [...this.shapeComponents.values()].forEach(c => c.destroy());
    this.strategyManage.getStrategy('uPlot')?.destroy();
    this.unbindThemeListener();
    this.off();
  }
}

/**
 * 注册 geometry 组件
 * @param name
 * @param Ctor
 * @returns Geometry
 */
export function registerShape(name: string, Ctor: ShapeCtor) {
  const key = name.toLowerCase() as ShapeType;
  // 语法糖，在 view API 上增加原型方法
  View.prototype[key] = function (options?: ShapeOptions) {
    const shape = new Ctor(this, options);
    this.shapeComponents.set(key, shape);
    return shape as any;
  };
}
