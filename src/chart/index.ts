import { select as d3Select } from 'd3';

import { D3EelSelection, D3Selection, Options } from '../types';
import { getChartSize, getElement, resizeOn } from '../utils';

import View from './view';

function createSvg(el: D3Selection) {
  return el.append('svg').style('overflow', 'hidden').style('display', 'block');
}
function parseContructorOption(options: Options) {
  const { container, width, height } = options;
  const ele = getElement(container);
  const d3El = d3Select(ele);
  d3El.attr('position', 'relative');

  const svg = createSvg(d3El);
  return {
    ele: d3El as unknown as D3EelSelection,
    svg,
    size: getChartSize(ele, width, height),
    options,
  };
}
export default class Chart extends View {
  ele: Element | HTMLElement;

  private resizeOn: () => void;

  constructor(options: Options) {
    super(parseContructorOption(options));
    this.ele = getElement(options.container);
    this.bindResize();
  }

  override destroy() {
    super.destroy();
    this.unbindResize();
  }

  private bindResize() {
    this.resizeOn = resizeOn(this.ele, this.onResize);
  }

  private unbindResize() {
    this.resizeOn();
  }

  private readonly onResize = () => {
    const { width: w, height: h } = this.options;
    this.changeSize(getChartSize(this.ele, w, h));
  };
}
