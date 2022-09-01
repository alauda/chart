import { Selection } from 'd3';
import { debounce } from 'lodash';

import { generateElName, getChartSize, transformD3El } from '../index.js';
import { DEFAULT_INTERACTIONS } from '../utils/constant.js';

import { View } from './view.js';

const CHART_NAME = generateElName('chart');

export class Chart extends View {
  el: HTMLElement;
  eleD3: Selection<HTMLElement, unknown, null, null>;
  private svgEl: HTMLElement;

  get width() {
    return +this.getAttribute('width');
  }

  set width(value) {
    if (!value) {
      this.removeAttribute('width');
    } else {
      this.setAttribute('width', String(value));
    }
  }

  get height() {
    return +this.getAttribute('height');
  }

  set height(value) {
    if (!value) {
      this.removeAttribute('height');
    } else {
      this.setAttribute('height', String(value));
    }
  }

  get defaultInteractions() {
    // TODO: 支持 array、obj、boolean等类型
    const defaultInteractions = this.getAttribute('defaultInteractions');
    return defaultInteractions
      ? defaultInteractions.split(',')
      : DEFAULT_INTERACTIONS;
  }

  constructor() {
    super();
    this.initDom();
    const size = getChartSize(this.el, this.width, this.height);
    super.init({
      ...size,
      svgEl: this.svgEl,
    });
  }

  /**
   * 组件添加document DOM 调用 绑定自适应事件
   */
  connectedCallback() {
    this.bindAutoFit();
  }

  override disconnectedCallback() {
    this.unbindAutoFit();
  }

  /**
   * 初始化
   * 创建变量、容器，添加 svg 设置样式
   */
  private initDom() {
    const shadowRoot = this.attachShadow({ mode: 'closed' });
    const container = document.createElement('div');
    const slot = document.createElement('slot');
    this.svgEl = document.createElement('svg');
    container.setAttribute('id', CHART_NAME);
    container.setAttribute('style', 'position: relative; height: 100%');
    container.append(this.svgEl);
    this.svgEl.append(slot);
    this.eleD3 = transformD3El(container);
    this.el = container;
    shadowRoot.append(container);

    this.initDefaultInteractions(this.defaultInteractions);
  }

  private initDefaultInteractions(interactions: string[]) {
    for (const interaction of interactions) {
      this.interaction(interaction);
    }
  }

  private bindAutoFit() {
    window.addEventListener('resize', this.onResize);
  }

  private unbindAutoFit() {
    window.removeEventListener('resize', this.onResize);
  }

  private readonly onResize = debounce(() => {
    const { width, height } = getChartSize(this.el, this.width, this.height);
    this.changeSize(width, height);
  }, 300);

  /**
   * 改变图表大小，重新渲染 （由 bbox内部处理）
   * @param width
   * @param height
   * @returns Chart
   */
  changeSize(width: number, height: number) {
    if (this.width === width && this.height === height) {
      return;
    }
    this.width = width;
    this.height = height;
    this.bbox.changeSize(width, height);
    // 重新渲染
    this.render();
    return this;
  }
}

customElements.define(CHART_NAME, Chart);
