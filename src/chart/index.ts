import { ChartOption, Size } from '../types/index.js';
// import { DEFAULT_INTERACTIONS } from '../utils/constant.js';
import { getChartSize, getElement, resizeObserver } from '../utils/index.js';

import { View } from './view.js';

export class Chart extends View {
  ele: HTMLElement;
  width: number;
  height: number;

  private sizeObserver: ResizeObserver;

  constructor(props: ChartOption) {
    const {
      container,
      width,
      height,
      padding,
      // defaultInteractions = DEFAULT_INTERACTIONS,
      options,
      data,
    } = props;
    const ele: HTMLElement = getElement(container);
    const size = getChartSize(ele, width, height);
    super({
      ele,
      ...size,
      padding,
      data,
      options,
    });
    this.ele = ele;
    this.width = size.width;
    this.height = size.height;
    // this.initDefaultInteractions(defaultInteractions);
    this.bindAutoFit();
  }

  // private initDefaultInteractions(interactions: string[]) {
  //   for (const interaction of interactions) {
  //     this.interaction(interaction);
  //   }
  // }

  private bindAutoFit() {
    this.sizeObserver = resizeObserver(this.ele, this.changeSize);
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
    this.width = width;
    this.height = height;
    // 重新渲染
    this.render({ width, height });
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
