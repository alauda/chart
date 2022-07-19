import { isFunction } from 'lodash';

import { UIController } from '../abstract';
import { View } from '../chart/view';
import { CLASS_NAME, STROKE_DASHARRAY, STROKE_WIDTH } from '../constant';
import { Scale } from '../service';
import {
  D3Selection,
  TooltipContext,
  TooltipContextItem,
  XScaleValue,
  YPlotLineOptions,
} from '../types';
import { rgbColor, template } from '../utils';

export class YPlotLine extends UIController<YPlotLineOptions> {
  container: D3Selection;

  tipContainer: D3Selection;

  tipContainerText: D3Selection;

  path: D3Selection;

  get hasTpl() {
    return typeof this.option.textFormatter === 'function';
  }

  get name() {
    return 'yPlotLine';
  }

  get dashType() {
    return !this.option?.dashType || this.option?.dashType === 'dash'
      ? STROKE_DASHARRAY
      : '0,0';
  }

  constructor(view: View) {
    super(view);
    this.option = this.owner.options.yPlotLine || {};
  }

  init() {
    if (!this.option.hide) {
      const plotLine = this.owner.chartEle.main.append('g');
      plotLine.attr('class', CLASS_NAME.yPlotLine);
      this.container = plotLine;
      this.tipContainer = this.owner.chartEle.chart
        .style('position', 'relative')
        .append('div')
        .attr('class', CLASS_NAME.yPlotLineTip)
        .style('position', 'absolute')
        .style('pointer-events', 'none')
        .style('display', 'none');
      this.tipContainerText = this.tipContainer
        .append('div')
        .attr('class', CLASS_NAME.yPlotLineTipText);
    }
  }

  render() {
    if (this.container) {
      this.path = this.container
        .append('path')
        .attr('fill', 'none')
        .attr(STROKE_WIDTH, 1)
        .attr('stroke-dasharray', this.dashType)
        .attr('stroke', rgbColor('n-6'));
      this.update(this.option.value);
    }
  }

  update(value?: TooltipContext) {
    this.option.value = value || this.option.value;
    const data = this.option.value;
    if (this.owner.noData) {
      this.container.attr('visibility', 'hidden');
      this.tipContainer.style('display', 'none');
      this.path.attr('d', '');
      return;
    }
    if (data) {
      this.container.attr('visibility', '');
      this.tipContainer.style('display', 'block');
      const scale = this.owner.getController('scale');
      this.path.attr('d', this.getPathD(data, scale));
      this.generateCircle(data.values, scale);
      this.updateTip(data, scale);
    }
  }

  private updateTip(value: TooltipContext, scale: Scale) {
    const text = this.option.text || (value.title as string);
    const textValue = isFunction(this.option.textFormatter)
      ? this.option.textFormatter(text)
      : template(this.option.textFormatter, { name: text });
    this.tipContainerText.text(textValue || text);

    const x = scale.x(value.values[0].x as XScaleValue);
    const { clientWidth: tipWidth, clientHeight: tipHight } =
      this.tipContainer.node() as HTMLElement;
    const mainW = this.owner.size.main.width;
    const offsetX = x + this.owner.basics.margin.left;
    const containerX = offsetX - tipWidth / 2;
    const position =
      tipWidth / 2 + (containerX + this.owner.basics.margin.left);
    const offset = position > mainW ? containerX - tipWidth / 2 : containerX;

    const {
      margin: { top },
    } = this.owner.basics;
    const manH = top + this.owner.headerTotalHeight;
    this.tipContainer.style('top', `${manH - (tipHight || 19) - 2}px`);
    this.tipContainer.style('left', `${offset}px`);
    this.tipContainer.style('display', 'block');
  }

  private generateCircle(values: TooltipContextItem[], scale: Scale) {
    this.container.selectAll(`.${CLASS_NAME.yPlotLineCircle}`).remove();
    this.container
      .selectAll(`.${CLASS_NAME.yPlotLineCircle}`)
      .data(values)
      .enter()
      .append('circle')
      .attr('class', CLASS_NAME.yPlotLineCircle)
      .attr('r', 2.5)
      .attr('stroke', d => d.color)
      .attr(STROKE_WIDTH, 1)
      .attr('fill', rgbColor('n-10'))
      .attr('cx', d => scale.x(d.x as XScaleValue))
      .attr('cy', d => scale.y(d.y));
  }

  private getPathD(value: TooltipContext, scale: Scale) {
    const x = scale.x(value.values[0].x as XScaleValue);
    const {
      margin: { top },
    } = this.owner.basics;
    const manH = top + this.owner.headerTotalHeight;
    return `M${x},${manH} L${x} ${this.owner.size.main.height}`;
  }

  destroy() {
    this.container?.remove();
  }
}
