import { UIController } from '../abstract/index.js';
import { View } from '../chart/index.js';
import { CLASS_NAME, STROKE_WIDTH } from '../constant.js';
import { D3Selection, XPlotLineOptions } from '../types/index.js';
import { getTextWidth, rgbColor } from '../utils/index.js';

export class XPlotLine extends UIController<XPlotLineOptions> {
  container: D3Selection;

  path: D3Selection;

  text: D3Selection;

  get name() {
    return 'xPlotLine';
  }

  get dashType() {
    return !this.option?.dashType || this.option?.dashType === 'dash'
      ? '4,2'
      : '0,0';
  }

  constructor(view: View) {
    super(view);
    this.option = this.owner.options.xPlotLine;
  }

  init() {
    if (!this.option?.hide) {
      const plotLine = this.owner.chartEle.main.append('g');
      plotLine.attr('class', CLASS_NAME.xPlotLine);
      this.container = plotLine;
    }
  }

  render() {
    if (this.container) {
      const { color } = this.option;
      this.path = this.container
        .append('path')
        .attr('fill', 'none')
        .attr(STROKE_WIDTH, 1)
        .attr('stroke-dasharray', this.dashType)
        .attr('stroke', color || rgbColor('n-6'));
      this.text = this.container
        .append('text')
        .attr('fill', color || rgbColor('n-2'))
        .attr('text-anchor', 'end')
        .attr('alignment-baseline', 'middle')
        .attr('font-size', 12)
        .attr('x', 16);
      this.update(this.option);
    }
  }

  update(option?: XPlotLineOptions) {
    this.option = option || this.option;
    const data = this.option.value;
    if (this.owner.noData) {
      this.container.attr('visibility', 'hidden');
      this.path.attr('d', '');
      return;
    }
    if (data) {
      this.container.attr('visibility', '');
      const scale = this.owner.getController('scale');
      const y = scale.y(data);
      this.path.attr('d', this.getPathD(y));
      this.text
        .attr('y', y - 10)
        .attr('x', getTextWidth(data))
        .text(data);
    }
  }

  private getPathD(y: number) {
    return `M0 ${y}L${this.owner.size.main.width} ${y}`;
  }

  destroy() {
    this.container?.remove();
  }
}
