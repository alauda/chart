import { merge, mergeWith } from 'lodash';
import UPlot from 'uplot';

import { Axis } from '../components/axis.js';
import { Data, LegendItemActive, Size } from '../types/index.js';
import { CHART_EVENTS, INTERACTION_TYPE } from '../utils/constant.js';
import { SHAPE_TYPES } from '../utils/index.js';

import { ViewStrategy } from './abstract.js';
import { UPLOT_DEFAULT_OPTIONS } from './config.js';
import { Quadtree } from './quadtree.js';

const SHAPES = SHAPE_TYPES;
/**
 * 渲染策略
 * uPlot 渲染图表
 */
export class UPlotViewStrategy extends ViewStrategy {
  shapes = SHAPES;

  qt: Quadtree;

  get name(): string {
    return 'uPlot';
  }

  get component(): string[] {
    return ['axis', 'tooltip', ...SHAPES];
  }

  private uPlot: uPlot;

  get isElementActive() {
    return this.ctrl.interactionType === INTERACTION_TYPE.ELEMENT_ACTIVE;
  }

  init() {
    this.getChartEvent();
  }

  /**
   * 监听 chart 事件
   */
  getChartEvent() {
    // 监听 主题改变
    this.ctrl.on(CHART_EVENTS.THEME_CHANGE, () => {
      if (this.uPlot) {
        this.uPlot.redraw();
      }
    });

    // 监听 legend item click
    this.ctrl.on(CHART_EVENTS.LEGEND_ITEM_CLICK, (data: LegendItemActive) => {
      if (this.uPlot) {
        this.uPlot.setSeries(data.index + 1, { show: !data.isActive }, true);
      }
    });

    this.ctrl.on(CHART_EVENTS.DATA_CHANGE, () => {
      if (this.uPlot) {
        const data = this.getData();
        this.uPlot.setData(data);
        if (this.uPlot.series.length < data.length) {
          this.getSeries().forEach((s: uPlot.Series, index) => {
            if (index) {
              this.uPlot.addSeries(s, index);
            }
          });
        }
        const legend = this.ctrl.components.get('legend');
        legend.update();
      }
    });
  }

  render(size?: Size) {
    const option = this.getOption();
    const data = option.data?.length ? option.data : this.getData();
    if (!this.uPlot) {
      console.log('UPlot', option, option.data, this.getData());
      this.uPlot = new UPlot(option, data, this.ctrl.container);
    }
    this.changeSize(size || this.ctrl.size);
  }

  /**
   * 修改 uPlot 视图大小
   * @param size 宽 高
   */
  private changeSize(size: Size) {
    this.uPlot.setSize(size);
    if (this.ctrl.getData().length) {
      this.uPlot.redraw(false);
    }
  }

  /**
   * 获取 uPlot 配置
   * 将原始 option 转换 uPlot 配置
   */
  private readonly getOption = (): uPlot.Options => {
    const { width, height } = this.ctrl.size;
    const series = this.getSeries();
    const theme = this.getThemeOption();
    const plugins = this.getPlugins();
    const shapeOptions = this.getShapeChartOption();
    const coordinate = this.ctrl.coordinateInstance.getOptions();
    const axis = (this.ctrl.components.get('axis') as Axis).getOptions();

    const source = {
      width,
      height,
      ...UPLOT_DEFAULT_OPTIONS,
      plugins,
      fmtDate: () => UPlot.fmtDate('{HH}:{mm}'),
      hooks: {
        drawClear: [
          (u: uPlot) => {
            this.qt =
              this.qt || new Quadtree(0, 0, u.bbox.width, u.bbox.height);
            this.qt.clear();
          },
        ],
        ready: [
          () => {
            this.ctrl.emit(CHART_EVENTS.U_PLOT_READY);
          },
        ],
      },
      series,
    };
    return mergeWith(
      source,
      coordinate,
      axis,
      theme,
      shapeOptions,
      (objValue: unknown, srcValue: unknown, key) => {
        if (Array.isArray(objValue) && Array.isArray(srcValue)) {
          if (key === 'plugins') {
            return objValue.concat(srcValue);
          }
          const objLonger = objValue.length > srcValue.length;
          const source = objLonger ? objValue : srcValue;
          const minSource = objLonger ? srcValue : objValue;
          return source.map((value: unknown, index) =>
            merge(value, minSource[index]),
          );
        }
      },
    );
  };

  /**
   * 获取数据
   * 原始数据转换为 uPlot 数据
   * @returns uPlot.AlignedData
   */
  getData(): uPlot.AlignedData {
    const data = this.ctrl.getData();
    return this.handleData(data);
  }

  /**
   * 将数据处理成 uPlot 数据格式
   * @param data 源数据
   * @returns uPlot 数据源哥是
   */
  handleData(data: Data): uPlot.AlignedData {
    if (!data.length) {
      return [];
    }
    const values = data.map(value => value.values);
    // type-coverage:ignore-next-line
    const x = values[0].map(value => value.x);
    const yItem = values.map(data => data.map(d => d.y));
    return [x, ...yItem];
  }

  /**
   * 获取 series
   * @param data 源数据
   * @returns uPlot series
   */
  getSeries() {
    const shapeSeries = this.shapes.reduce((prev, name) => {
      const comp = this.ctrl.shapeComponents.get(name);
      return comp ? [comp.getSeries(), ...prev] : prev;
    }, []);

    console.log('shapeComp', shapeSeries.flat());
    return [{}, ...shapeSeries.flat()];
  }

  /**
   * 获取 shape uPlot 配置
   * @returns uPlot option
   */
  getShapeChartOption() {
    return this.shapes.reduce((prev, name) => {
      const comp = this.ctrl.shapeComponents.get(name);
      return comp ? merge(prev, comp.getOptions()) : prev;
    }, {});
  }

  /**
   * 获取主题 配置
   */
  getThemeOption() {
    if (!this.ctrl.getTheme()) {
      return;
    }
    return {
      axes: [
        {
          stroke: () => this.ctrl.getTheme().xAxis.stroke,
          ticks: {
            stroke: () => this.ctrl.getTheme().xAxis.tickStroke,
          },
        },
        {
          stroke: () => this.ctrl.getTheme().yAxis.stroke,
          grid: {
            stroke: () => this.ctrl.getTheme().yAxis.gridStroke,
          },
          ticks: {
            stroke: () => this.ctrl.getTheme().yAxis.tickStroke,
          },
        },
      ],
    };
  }

  getPlugins() {
    return [this.getTooltipPlugin()];
  }

  getTooltipPlugin() {
    let over: HTMLDivElement;
    let bound: HTMLDivElement;
    let bLeft: number;
    let bTop: number;
    let cacheData: { title: string | number; values: Data };
    return {
      hooks: {
        init: (u: UPlot) => {
          over = u.over;
          bound = over;
          over.addEventListener('mouseenter', () => {
            if (u.series.some(d => d.scale === 'y' && d.show)) {
              this.showTooltip(INTERACTION_TYPE.TOOLTIP);
            }
          });
          over.addEventListener('mouseleave', () => {
            this.hideTooltip(INTERACTION_TYPE.TOOLTIP);
          });
        },
        setSize: () => {
          const bbox = over.getBoundingClientRect();
          bLeft = bbox.left;
          bTop = bbox.top;
        },
        setCursor: (u: uPlot) => {
          const { left, top, idx, idxs } = u.cursor;
          const x = u.data[0][idx];
          const anchor = { left: left + bLeft, top: top + bTop };
          const data = this.ctrl.getData();

          const ySeries = u.series.filter(d => d.scale === 'y');

          const values = data.reduce((prev, curr, index) => {
            const allow = this.isElementActive ? idxs[index + 1] : true;
            return ySeries[index]?.show && allow
              ? [
                  ...prev,
                  {
                    name: curr.name,
                    color: curr.color,
                    value: curr.values[idx || 0].y,
                  },
                ]
              : prev;
          }, []);
          if (!this.isElementActive) {
            cacheData = {
              title: x,
              values,
            };
          }
          if (idxs.some(Boolean)) {
            cacheData = {
              title: x,
              values,
            };
            this.showTooltip(INTERACTION_TYPE.ELEMENT_ACTIVE);
          } else {
            this.hideTooltip(INTERACTION_TYPE.ELEMENT_ACTIVE);
          }

          if (cacheData) {
            this.ctrl.emit(CHART_EVENTS.U_PLOT_SET_CURSOR, {
              bound,
              anchor,
              title: cacheData.title,
              values: cacheData.values,
            });
          }
        },
      },
    };
  }

  private showTooltip(type: INTERACTION_TYPE) {
    if (this.ctrl.interactionType === type) {
      this.ctrl.emit(CHART_EVENTS.U_PLOT_OVER_MOUSEENTER);
    }
  }

  private hideTooltip(type: INTERACTION_TYPE) {
    if (this.ctrl.interactionType === type) {
      this.ctrl.emit(CHART_EVENTS.U_PLOT_OVER_MOUSELEAVE);
    }
  }
}
