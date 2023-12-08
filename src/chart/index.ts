import { ChartOption, Size } from '../types/index.js';
import { DEFAULT_INTERACTIONS } from '../utils/constant.js';
// import { DEFAULT_INTERACTIONS } from '../utils/constant.js';
import {
  generateName,
  getChartSize,
  getElement,
  resizeObserver,
} from '../utils/index.js';

import { View } from './view.js';

export class Chart extends View {
  chartEle: HTMLElement;
  ele: HTMLElement;
  width: number;
  height: number;

  private sizeObserver: ResizeObserver;

  constructor(props: ChartOption) {
    const {
      container,
      width,
      autoFit = true,
      height,
      padding,
      defaultInteractions = DEFAULT_INTERACTIONS,
      options,
      data,
    } = props;
    const chartEle: HTMLElement = getElement(container);
    const header = document.createElement('div');
    header.className = generateName('header');
    chartEle.append(header);
    const ele = document.createElement('div');
    chartEle.append(ele);

    if (autoFit) {
      chartEle.style.width = '100%';
      chartEle.style.height = '100%';
      chartEle.style.justifyContent = 'space-between';
    }
    ele.style.position = 'relative';
    ele.style.height = '100%'
    chartEle.style.flexDirection = 'column';
    chartEle.style.display = 'flex';
    ele.style.flex = '1';
    if (width) {
      chartEle.style.width = `${width}px`;
    }
    if (height) {
      chartEle.style.height = `${height}px`;
    }
    const size = getChartSize(ele, width, height);
    const opts = {
      chartEle,
      ele,
      ...size,
      padding,
      data,
      options,
      defaultInteractions,
      chartOption: props,
    };
    super(opts);
    this.chartEle = chartEle;
    this.ele = ele;
    this.width = size.width;
    this.height = size.height;
    this.bindAutoFit();
  }

  /**
   * 绑定自动伸缩视图
   */
  private bindAutoFit() {
    this.sizeObserver = resizeObserver(this.chartEle, this.changeSize);
  }

  private unbindAutoFit() {
    this.sizeObserver.disconnect();
  }

  /**
   * 改变图表大小，重新渲染 （由 bbox内部处理）
   * @param width
   * @param height
   * @returns Chart
   */
  changeSize = ({ width, height }: Size) => {
    if (this.width === width && this.height === height) {
      return;
    }
    const size = getChartSize(this.ele, width, height);
    this.width = size.width;
    this.height = size.height;
    // 重新渲染
    this.render(size);
    return this;
  };

  /**
   * 销毁图表
   */
  override destroy() {
    super.destroy();
    this.unbindAutoFit();
    this.ele = null;
  }
}
