import UPlot from 'uplot';

import { Data, getChartColor, Size } from '../index.js';

import { ViewStrategy } from './abstract.js';
import { UPLOT_DEFAULT_OPTIONS } from './config.js';
import 'uplot/dist/uPlot.min.css';
import uPlot from 'uplot';
import { merge } from 'lodash';
import { CHART_EVENTS } from '../utils/constant.js';

/**
 * 渲染策略
 * uPlot 渲染图表
 */
export class UPlotViewStrategy extends ViewStrategy {
  get name(): string {
    return 'uPlot';
  }

  get component(): string[] {
    return ['axis', 'tooltip', 'line', 'area', 'bar', 'point'];
  }

  private uPlot: uPlot;

  init() {
    // ..
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
  }

  render(size?: Size) {
    const option = this.getOption();
    const data = this.getData();
    if (!this.uPlot) {
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
    this.uPlot.redraw(false);
  }

  /**
   * 获取 uPlot 配置
   * 将原始 option 转换 uPlot 配置
   */
  private readonly getOption = (): uPlot.Options => {
    const { width, height } = this.ctrl.size;
    const series = this.getSeries(this.ctrl.getData());
    const theme = this.getThemeOption();
    return merge(
      {
        width,
        height,
        ...UPLOT_DEFAULT_OPTIONS,
        series,
      },
      theme,
    );
  };

  /**
   * 获取数据
   * 原始数据转换为 uPlot 数据
   * @returns uPlot.AlignedData
   */
  private getData(): uPlot.AlignedData {
    // TODO: test
    const data = this.ctrl.getData();
    return this.handleData(data);
  }

  /**
   * 将数据处理成 uPlot 数据格式
   * @param data 源数据
   * @returns uPlot 数据源哥是
   */
  handleData(data: Data): uPlot.AlignedData {
    const values = data.map(value => value.values);
    const x = values[0].map(value => value.x);
    const yItem = values.map(data => data.map(d => d.y));
    return [x, ...yItem];
  }

  /**
   * 获取 series
   * @param data 源数据
   * @returns uPlot series
   */
  getSeries(data: Data) {
    return [
      {},
      ...data.map(({ color, name }, index) => ({
        stroke: color || getChartColor(index),
        label: name,
        points: {
          show: false,
        },
        paths: uPlot.paths.spline(),
      })),
    ];
  }

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
}
