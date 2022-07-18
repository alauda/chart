import { find, isFunction, mergeWith } from 'lodash';

import {
  Controller,
  ControllerCtor,
  ServiceController,
  UIController,
} from '@src/abstract';
import {
  Axis,
  Legend,
  YPlotLine,
  Series,
  Title,
  Tooltip,
  XPlotLine,
} from '@src/components';
import {
  basics,
  CHART_DEPENDS_MAP,
  CLASS_NAME,
  LEGEND_EVENTS,
  VIEW_HOOKS,
} from '@src/constant';
import EventEmitter from '@src/event-emitter';
import { Scale, ControllerContextService } from '@src/service';
import {
  BarSeriesOption,
  ChartData,
  ChartEle,
  ChartSize,
  D3SvgSSelection,
  Data,
  Options,
  PieSeriesOption,
  Theme,
  TitleOption,
  TooltipContext,
  ViewProps,
  XData,
  XPlotLineOptions,
} from '@src/types';
import { generateUID, getChartColor, getTextWidth, template } from '@src/utils';
import { Zoom } from '../components/zoom';
import { Pie } from '../components/pie';

export default class View extends EventEmitter {
  chartEle!: ChartEle;

  chartUId: string;

  uiControllers: UIController[] = [];
  serviceControllers: ServiceController[] = [];

  options: Options = {
    data: [],
    container: '',
  };

  chartData: ChartData[] = [];

  chartSize: ChartSize;

  size: {
    [key: string]: ChartSize;
  } = {};

  get isBar() {
    return this.options.type === 'bar';
  }

  get isGroup() {
    return (this.options?.seriesOption as BarSeriesOption)?.isGroup;
  }

  get isRotated() {
    return this.options.rotated;
  }

  get noData() {
    return (
      this.chartData.length === 0 ||
      this.chartData?.every(d => d?.values?.every(item => item?.y === null))
    );
  }

  get tooltipDisabled() {
    return this.options.tooltip?.disabled;
  }

  get legendDisabled() {
    return !this.options.legend;
  }

  get titleDisabled() {
    return !this.options.title;
  }

  get zoomDisabled() {
    return !this.options.zoom?.enabled;
  }

  get yPlotLineDisabled() {
    return this.options?.yPlotLine?.hide;
  }

  get xPlotLineDisabled() {
    return this.options?.xPlotLine?.hide || !this.options.xPlotLine;
  }

  get noHeader() {
    return (
      (!this.options.title && !this.options.legend) ||
      (this.options?.title?.hide && this.options?.legend?.hide)
    );
  }

  get headerHeight() {
    const title = document.getElementsByClassName(
      CLASS_NAME.title,
    )[0] as SVGGElement;
    const legend = document.getElementsByClassName(
      CLASS_NAME.legend,
    )[0] as SVGGElement;
    const titleH = title?.getBBox?.()?.height || title?.clientHeight;
    const legendH = legend?.getBBox?.()?.height || legend?.clientHeight;
    return Math.max(...[titleH || 25, legendH || 0, 0]);
  }

  get headerTotalHeight() {
    return this.headerHeight + this.basics.main.top;
  }

  context = new ControllerContextService();

  basics = basics;

  static setTheme(theme: Theme) {
    const root = document.querySelector('html');
    root.setAttribute('ac-theme-mode', theme);
  }

  constructor({ ele, size, svg, options }: ViewProps) {
    super();
    this.options = {
      type: 'line',
      offset: { x: 0, y: 0 },
      grid: { top: 0 },
      ...this.options,
      ...options,
      data: this.handelData(options.data),
    };
    this.handleBasics();
    this.chartEle = { chart: ele, svg, main: this.createMain(svg) };
    this.chartUId = `ac-chart-uid-${generateUID()}`;
    this.chartEle.chart.attr('class', `ac-chart-wrapper ${this.chartUId}`);
    this.chartEle.chart.style('width', '100%').style('height', '100%');
    this.chartData = this.options.data;
    this.changeSize(size);
    this.init();
    this.options.contextCallbackFunction?.(this);
  }

  setOptions(options: Options) {
    // TODO: 异步修改 option 调整方法
    if (!this.options.contextCallbackFunction) {
      options.contextCallbackFunction?.(this);
    }
    this.asyncUpdateZoomOption(options);
    const newOptions = mergeWith(this.options, options) as Options;
    this.options = newOptions;
  }

  handelData(data: ChartData[]) {
    const res = data.map((d, index) => ({
      ...d,
      ...(d.color ? {} : { color: getChartColor(index) }),
    }));
    return res;
  }

  init() {
    this.registerComponents();
    this.initComponentController();
    this.render();
    // 监听事件
    this.subscribeEvents();
  }

  registerComponents() {
    if (!this.tooltipDisabled) {
      this.context.registerComponent(Tooltip);
    }
    if (!this.titleDisabled) {
      this.context.registerComponent(Title);
    }

    if (!this.yPlotLineDisabled) {
      this.context.registerComponent(YPlotLine);
    }

    if (!this.xPlotLineDisabled) {
      this.context.registerComponent(XPlotLine);
    }

    CHART_DEPENDS_MAP[this.options.type].forEach(C =>
      this.context.registerComponent(C),
    );

    if (!this.legendDisabled) {
      this.context.registerComponent(Legend);
    }

    if (!this.zoomDisabled) {
      this.context.registerComponent(Zoom);
    }
  }

  // TODO: 先手动异步注册 zoom
  asyncUpdateZoomOption(options: Options) {
    if (options?.zoom?.enabled && !this.getController('zoom')) {
      this.context.registerComponent(Zoom);
      const instance = this.buildController(Zoom, this);
      this.uiControllers.push(instance as UIController);
      this.getController('zoom').init();
    }
  }

  render() {
    // 触发 component render
    this.renderComponent();
    // 渲染后事件
    this.emit(VIEW_HOOKS.AFTER_RENDER);
  }

  destroy() {
    // 销毁前事件
    this.emit(VIEW_HOOKS.BEFORE_DESTROY);
  }

  changeSize(size: ChartSize) {
    this.chartSize = size;
    this.chartEle.svg
      .attr('width', size.width || '100%')
      .attr('height', size.height || '100%');
    this.flush(size);
  }

  data(data: ChartData[]) {
    const res = this.handelData(data);
    this.options.data = res;
    this.emit(VIEW_HOOKS.SET_DATA, this.options.data);
    const legend = this.getController('legend');
    if (legend.disabledLegend.size) {
      const data = this.handleLegendDisableData();
      this.changeData(data);
      return;
    }
    this.changeData(res);
  }

  changeData(data: ChartData[]) {
    this.emit(VIEW_HOOKS.CHANGE_DATA, data);
    this.chartData = data;
    this.flush();
  }

  getTranslate() {
    const {
      margin: { left, top },
    } = this.basics;
    return `translate(${left}, ${top})`;
  }

  flush(size?: ChartSize) {
    this.handleBasics();
    this.computeSize(size || this.chartSize);
    this.handleMainTransform();
    // TODO: 先手动触发更新函数
    const axis = this.getController('axis');
    const legend = this.getController('legend');
    const series = this.getController('series');
    const tooltip = this.getController('tooltip');
    const yPlotLine = this.getController('yPlotLine');
    const xPlotLine = this.getController('xPlotLine');
    const pie = this.getController('pie');

    axis?.updateAxis();
    legend?.updateLegend();
    series?.updateSeries();
    tooltip?.update();
    yPlotLine?.update();
    xPlotLine?.update();
    pie?.update();
  }

  getController(name: 'scale'): Scale;

  getController(name: 'title'): Title;

  getController(name: 'legend'): Legend;

  getController(name: 'series'): Series;

  getController(name: 'axis'): Axis;

  getController(name: 'tooltip'): Tooltip;

  getController(name: 'zoom'): Zoom;

  getController(name: 'yPlotLine'): YPlotLine;

  getController(name: 'xPlotLine'): XPlotLine;

  getController(name: 'pie'): Pie;

  getController(name: string): Controller;

  getController(name: string) {
    return find(
      [...this.uiControllers, ...this.serviceControllers],
      (c: Controller) => c.name === name,
    );
  }

  // TODO: 组件实例挂在到 Chart
  // chart.yPlotLine(options)
  updateYPlotLine = (value: TooltipContext) => {
    const yPlotLine = this.getController('yPlotLine');
    this.options.yPlotLine = {
      ...this.options.yPlotLine,
      value,
    };
    yPlotLine?.update(value);
  };

  updateXPlotLine = (option: XPlotLineOptions) => {
    const xPlotLine = this.getController('xPlotLine');
    this.options.xPlotLine = {
      ...this.options.xPlotLine,
      ...option,
    };
    xPlotLine?.update(this.options.xPlotLine);
  };

  updateTitle = (option: TitleOption) => {
    const title = this.getController('title');
    this.options.title = {
      ...this.options.xPlotLine,
      ...option,
    };
    title?.update(this.options.title);
  };

  updatePie = (option: PieSeriesOption) => {
    const pie = this.getController('pie');
    const newSeries = mergeWith(
      this.options.seriesOption,
      option,
    ) as PieSeriesOption;
    this.options.seriesOption = newSeries;
    pie?.update();
  };

  // 计算
  private computeSize({ width, height }: ChartSize) {
    const { margin, tickLabelWidth } = this.basics;
    const mainW = width - margin.left - tickLabelWidth;
    this.size = {
      chart: { width, height },
      main: {
        width: mainW,
        height: height - this.headerHeight,
      },
      grid: {
        width: mainW,
        height:
          height - margin.top - this.headerHeight - this.headerTotalHeight,
      },
    };
  }

  private createMain(svg: D3SvgSSelection) {
    return svg.append('g').classed('chart-main', true);
  }

  private initComponentController() {
    const components = this.context.getComponents();
    for (let i = 0, len = components.length; i < len; i++) {
      const Ctor = components[i];
      const instance = this.buildController(Ctor, this);
      if (typeof (instance as UIController).render === 'function') {
        this.uiControllers.push(instance as UIController);
      } else {
        this.serviceControllers.push(instance);
      }
    }
    [...this.uiControllers, ...this.serviceControllers].forEach(i => {
      i.init();
    });
  }

  private readonly widgets: Map<
    ControllerCtor,
    UIController | ServiceController
  > = new Map();

  private buildController(Ctor: ControllerCtor, ctx: View) {
    if (!this.widgets.has(Ctor)) {
      this.widgets.set(Ctor, new Ctor(ctx));
    }
    return this.widgets.get(Ctor)!;
  }

  private renderComponent() {
    const components = this.uiControllers;
    for (let i = 0, len = components.length; i < len; i++) {
      const c = components[i];
      c.render();
    }
  }

  private handleMainTransform() {
    this.chartEle?.main?.attr('transform', this.getTranslate());
  }

  private subscribeEvents() {
    if (this.legendDisabled) {
      return;
    }
    this.on(LEGEND_EVENTS.CLICK, () => {
      const data = this.handleLegendDisableData();
      this.changeData(data);
    });

    this.on(LEGEND_EVENTS.SELECT_ALL, () => {
      this.changeData(this.options.data);
    });
    this.on(LEGEND_EVENTS.UNSELECT_ALL, () => {
      this.changeData([]);
    });
  }

  private handleLegendDisableData() {
    const legend = this.getController('legend');
    return this.options.data.reduce<ChartData[]>((prev, curr) => {
      if (this.isBar) {
        return [
          ...prev,
          {
            ...curr,
            values: curr.values.reduce<Array<Data<XData>>>(
              (acc, value) =>
                legend.disabledLegend.has(value.x as string)
                  ? acc
                  : [...acc, value],
              [],
            ),
          },
        ];
      }
      if (!legend.disabledLegend.has(curr.name)) {
        return [...prev, curr];
      }
      return prev;
    }, []);
  }

  private handleBasics() {
    const { left, top } = basics.margin;
    const { x = 0, y = 0 } = this.options.offset;
    const scale = this.getController('scale');
    const domain = this.isRotated
      ? (scale?.xDomain as string[])
      : scale?.yDomain;
    const yLabel = this.getYLabel(
      domain?.[1] || '',
      this.options.yAxis?.tickFormatter,
    );
    const yLabelWidth = getTextWidth(yLabel) || 10;
    const data = {
      ...basics,
      margin: { ...basics.margin, left: left + yLabelWidth + x, top: y + top },
      main: { top: basics.main.top + (this.options?.grid?.top || 0) },
    };
    this.basics = this.noHeader
      ? {
          ...data,
          margin: { ...data.margin, top: 0 },
        }
      : data;
  }

  getYLabel(
    value: string | number,
    tickFormatter?:
      | string
      | ((value?: any) => string | ((value: any) => string)),
  ) {
    const text = isNaN(+parseInt(value as string))
      ? value 
      : parseInt(value as string);
    if (tickFormatter) {
      if (isFunction(tickFormatter)) {
        const formatter = tickFormatter(text);
        return isFunction(formatter) ? formatter(text) : formatter;
      }
      return template(tickFormatter, { text });
    }
    return text;
  }
}
