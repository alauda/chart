import { select as d3Select } from 'd3';

import { D3EelSelection, D3Selection, Options } from '../types/index.js';
import { getChartSize, getElement, resizeOn } from '../utils/index.js';

import { View } from './view.js';

export * from './view.js';

function createSvg(el: D3Selection) {
  return el
    .append('svg')
    .style('width', '100%')
    .style('height', '100%')
    .style('overflow', 'hidden')
    .style('display', 'inline-block');
}

function parseConstructorOption(options: Options) {
  const { container, width, height, customHeader } = options;
  const ele = getElement(container);
  const d3El = d3Select(ele);
  let header: D3EelSelection;
  d3El.attr('position', 'relative');

  if (customHeader) {
    header = d3El.append('div');
    header.attr('class', 'ac-header');
  }
  const containerDom = d3El
    .append('div')
    .attr('class', 'ac-container')
    .style('width', '100%')
    .style('height', '100%');
  const svg = createSvg(containerDom);
  return {
    ele: d3El as unknown as D3EelSelection,
    container: containerDom,
    header,
    svg,
    size: getChartSize(ele, width, height),
    options,
  };
}

export class Chart extends View {
  ele: Element | HTMLElement;
  container: Element | HTMLElement;

  private resizeOn: () => void;

  constructor(options: Options) {
    const opt = parseConstructorOption(options);
    super(opt);
    this.ele = getElement(options.container);
    this.container = opt.container.node();
    this.bindResize();
  }

  override destroy() {
    super.destroy();
    this.unbindResize();
  }

  private bindResize() {
    this.resizeOn = resizeOn(this.container, this.onResize);
  }

  private unbindResize() {
    this.resizeOn();
  }

  private readonly onResize = (entry: ResizeObserverEntry) => {
    const { width: w, height: h } = this.options;
    const { width, height } = entry.contentRect;
    this.changeSize(getChartSize(this.container, w || width, h || height));
  };
}
