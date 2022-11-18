import { UIController } from '../../abstract/index.js';
import { View } from '../../chart/index.js';
import { AxisOption, D3Selection } from '../../types/index.js';

import AxisRender from './axis-render.js';

const ORIENT: Record<string, string> = {
  x: 'bottom',
  y: 'left',
};

export class Axis extends UIController<AxisOption> {
  x!: D3Selection;

  y!: D3Selection;

  xAxis!: AxisRender;

  yAxis!: AxisRender;

  xOption: AxisOption;

  yOption: AxisOption;

  get name() {
    return 'axis';
  }

  get isRotated() {
    return this.owner.isRotated;
  }

  constructor(owner: View) {
    super(owner);
    this.xOption = this.owner.options.xAxis || {};
    this.yOption = this.owner.options.yAxis || {};
  }

  init() {
    const target: ['x', 'y'] = ['x', 'y'];
    const {
      chartEle: { main },
      size,
    } = this.owner;
    const { width, height } = size.main;
    const w = this.isRotated ? height : width;
    const h = this.isRotated ? width : height;
    for (const v of target) {
      const axisMain = main
        .append('g')
        .attr('class', `axis-${v}`)
        .attr(
          'transform',
          `translate(0, ${
            v === 'x'
              ? this.isRotated
                ? 0
                : Math.max(height, 0)
              : this.isRotated
              ? Math.max(height, 0)
              : 0
          })`,
        )
        .lower();

      this[v] = axisMain;

      this[`${v}Axis`] = new AxisRender({
        owner: this.owner,
        g: axisMain,
        name: v,
        option: this[`${v}Option`],
        isRotated: !!this.isRotated,
        config: {
          range: v === 'x' ? [0, w] : [h, 0],
          orient: ORIENT[v],
        },
      });
    }
  }

  render() {
    this.xAxis.render();
    this.yAxis.render();
  }

  destroy() {
    this.x.remove();
    this.y.remove();
  }

  updateAxis() {
    const { height } = this.owner.size.main;
    const maxH = Math.max(height, 0);
    this.x.attr('transform', `translate(0, ${this.isRotated ? 0 : maxH})`);
    this.y.attr('transform', `translate(0, ${this.isRotated ? maxH : 0})`);
    this.xAxis.updateTick();
    this.yAxis.updateTick();
  }
}
