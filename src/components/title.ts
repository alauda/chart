import { UIController } from '../abstract/index.js';
import { View } from '../chart/index.js';
import { CLASS_NAME } from '../constant.js';
import { D3Selection, TitleOption } from '../types/index.js';
import { template } from '../utils/index.js';

const OFFSET = {
  x: 0,
  y: 20,
};

export class Title extends UIController<TitleOption> {
  container: D3Selection;

  get hasTpl() {
    return (
      typeof this.option.formatter === 'function' ||
      this.owner.options.customHeader
    );
  }

  get name() {
    return 'title';
  }

  constructor(view: View) {
    super(view);
    this.option = view.options.title || {};
  }

  init() {
    if (this.option.text && !this.option.hide) {
      this.createContainer();
    }
  }

  render() {
    this.update(this.option);
  }

  update(option?: TitleOption) {
    this.option = option || this.option;
    const { formatter, hide } = this.option;
    this.createContainer();
    if (this.container && !hide) {
      const { offsetX, offsetY, text } = this.option;
      const y = offsetY || 0;
      const x = this.owner.basics.padding.left + (offsetX || 0);
      if (typeof formatter === 'function') {
        if (this.hasTpl) {
          this.container.attr(
            'style',
            `padding-top: ${y}px; padding-left: ${x}px`,
          );
        }
        this.container.html(formatter(text));
        return;
      }
      this.container.selectAll('*').remove();
      const textEl = this.container
        .append('text')
        .attr('class', CLASS_NAME.titleText);
      textEl.attr('transform', `translate(${x}, ${y})`);
      textEl
        .append('tspan')
        .attr('x', OFFSET.x)
        .attr('dy', OFFSET.y)
        .text(template(formatter, { text }) || text);
    }
  }

  private createContainer() {
    if (this.container) {
      return;
    }
    const title = this.hasTpl
      ? (this.owner.chartEle.header || this.owner.chartEle.chart).append('div')
      : this.owner.chartEle.svg.append('g');
    title.attr('class', CLASS_NAME.title);
    this.container = title;
  }

  destroy() {
    this.container?.remove();
  }
}
