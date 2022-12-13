import UPlot from 'uplot';

import { Size } from '../index.js';

import { ViewStrategy } from './abstract.js';
import { UPLOT_DEFAULT_OPTIONS } from './config.js';
import 'uplot/dist/uPlot.min.css';

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
    return {
      width,
      height,
      ...UPLOT_DEFAULT_OPTIONS,
      series: [],
    };
  };

  /**
   * 获取数据
   * 原始数据转换为 uPlot 数据
   * @returns uPlot.AlignedData
   */
  private getData(): uPlot.AlignedData {
    // TODO: test
    return [
      [1_546_300_800, 1_546_387_200], // x-values (timestamps)
      [35, 71], // y-values (series 1)
      [90, 15], // y-values (series 2)
    ];
  }
}
