import { select, Selection } from 'd3';

import { UIController } from '@src/abstract';
import View from '@src/chart/view';
import { CLASS_NAME, LEGEND_EVENTS } from '@src/constant';
import { D3Selection, Data, LegendOption } from '@src/types';
import { getChartColor, template } from '@src/utils';
import { clone } from 'lodash';

export interface LegendItem {
  name: string;
  activate: boolean;
  color: string;
}
const OPTIONS = {
  x: 0,
  y: 10,
  margin: 12,
  rectWidth: 16,
  rectHeight: 2,
  rectMargin: 4,
  rx: 0,
};
export class Legend extends UIController<LegendOption> {
  container!: D3Selection;

  legendCt!: Selection<SVGGElement, LegendItem, any, any>;

  legendRectCt!: Selection<SVGRectElement, LegendItem, any, any>;

  legendIconCt!: Selection<SVGRectElement, LegendItem, any, any>;

  get name() {
    return 'legend';
  }

  get isCircle() {
    return ['pie', 'scatter'].includes(this.owner.options.type);
  }

  get isScatter() {
    return this.owner.options.type === 'scatter';
  }

  get hasTpl() {
    return typeof this.option.formatter === 'function';
  }

  get isMount() {
    return this.option.isMount;
  }

  get innerOptions() {
    const circle = {
      rectWidth: 6,
      rectHeight: 6,
      rx: 6,
    };
    return {
      ...OPTIONS,
      ...(this.isCircle ? circle : {}),
    };
  }

  disabledLegend: Set<string> = new Set();

  legendItems: LegendItem[] = [];

  constructor(owner: View) {
    super(owner);
    this.option = owner.options.legend || {};
    this.init();
  }

  init() {
    if (!this.option.hide) {
      const legendEl = this.hasTpl
        ? this.owner.chartEle.chart.append('div')
        : this.owner.chartEle.svg.append('g');
      this.container = legendEl;
      this.owner.chartEle.legend = legendEl;
    }
  }

  render() {
    if (this.owner.chartEle.legend) {
      this.updateLegend();
    }
  }

  destroy() {
    this.container.remove();
  }

  reset() {
    this.disabledLegend.clear();
  }

  updateLegend() {
    this.setLegendItemsData();
    if (this.container) {
      const { offsetX, offsetY } = this.option;
      const box = this.owner.chartEle.svg.node();
      const width = box.clientWidth - this.owner.basics.padding.left || 0;
      const x = width + (offsetX || 0);
      const y = this.innerOptions.y + (offsetY || 0);
      if (
        !this.container.selectAll(`.${CLASS_NAME.legendItem}`).size() &&
        !this.isMount
      ) {
        this.setLegendItem();
      }
      if (this.hasTpl) {
        return this.container
          .attr('class', CLASS_NAME.legend)
          .attr(
            'style',
            `position: absolute; top: ${offsetY || 0}px; right: ${
              this.owner.basics.margin.right + (offsetX || 0)
            }px`,
          );
      }
      this.container
        .attr('class', CLASS_NAME.legend)
        .attr('transform', `translate(${x}, ${y})`);
    }
  }

  setLegendItem() {
    if (typeof this.option.formatter === 'function') {
      this.container.html(this.option.formatter(this.legendItems));
    } else {
      this.createLegendItemDom();
    }
    this.bindEvent(this.legendCt);
  }

  bindEvent(el: D3Selection) {
    el?.on('click', (event: Event, data: LegendItem) => {
      this.changeLegend(this.legendItems.find(d => data.name === d.name));
      this.setTargetClass(event, CLASS_NAME.legendItemHidden);
    });
  }

  changeLegend(legend: LegendItem) {
    const { name, activate } = legend;
    if (activate) {
      this.disabledLegend.add(name);
    } else {
      this.disabledLegend.delete(name);
    }
    this.setLegendItemsData();
    this.owner.emit(LEGEND_EVENTS.CLICK, {
      legend,
      source: this.legendItems,
    });
  }

  legendSelectAll() {
    this.disabledLegend.clear();
    this.owner.emit(LEGEND_EVENTS.SELECT_ALL);
  }

  legendUnselectAll() {
    const all = this.owner.options.data.map(d => d.name);
    this.disabledLegend = new Set(all);
    this.owner.emit(LEGEND_EVENTS.UNSELECT_ALL);
  }

  setLegendItemsData() {
    let cloneData = this.hasTpl
      ? this.owner.options.data
      : clone(this.owner.options.data).reverse();
    cloneData = cloneData.filter(d => d.name);
    const values = cloneData.flatMap(item => item.values) as Array<
      Data<{ x: string; color: string; name: string }>
    >;
    this.legendItems =
      this.owner.options.type === 'bar'
        ? values.reduce<Array<Data<LegendItem>>>(
            (pre, cur) => [
              ...pre,
              ...(pre.some(d => d.name === cur.x)
                ? []
                : [
                    {
                      name: cur.x,
                      color: cur.color || getChartColor(pre.length),
                      activate: !this.disabledLegend.has(cur.x),
                    },
                  ]),
            ],
            [],
          )
        : cloneData.map(d => {
            return {
              name: d.name,
              color: d.color || '',
              activate: !this.disabledLegend.has(d.name),
            };
          });
  }

  private setTargetClass(event: Event, className: string) {
    const rect = this.getRectTarget(event);
    const hide = rect.classed(className);
    rect.classed(className, !hide);
  }

  private getRectTarget(event: Event) {
    const target = event.target as SVGRectElement;
    return select(target.parentNode as SVGRectElement);
  }

  private createLegendItemDom() {
    this.legendCt = this.container
      .selectAll(`.${CLASS_NAME.legend}`)
      .data(this.legendItems)
      .enter()
      .append('g')
      .attr('class', CLASS_NAME.legendItem)
      .style('cursor', 'pointer');

    this.legendRectCt = this.legendCt
      .append('rect')
      .attr('class', CLASS_NAME.legendItemEvent);

    this.legendIconCt = this.legendCt
      .append('rect')
      .attr('class', CLASS_NAME.legendItemIcon)
      .attr('width', this.innerOptions.rectWidth)
      .attr('height', this.innerOptions.rectHeight)
      .attr('rx', this.innerOptions.rx)
      .attr('fill', d => d.color || '');

    this.setPosition();
  }

  private setPosition() {
    this.legendCt
      .append('text')
      .text(data => {
        if (this.option.itemFormatter) {
          if (typeof this.option.itemFormatter === 'function') {
            return this.option.itemFormatter(data.name);
          }
          return template(this.option.itemFormatter, data);
        }
        return data.name;
      })
      .attr('x', (_, index, target) => -target[index].getBBox().width)
      .attr('y', (_, index, target) => target[index].getBBox().height / 4);

    this.legendIconCt
      .attr('y', -(this.innerOptions.rectHeight / 2))
      .attr(
        'x',
        (_, index, target) =>
          -(getParentNode(index, target).width + this.innerOptions.rectMargin),
      );

    this.legendCt.attr('transform', (_, index, targets) => {
      const width = targets[0].getBBox().width * (index - 1);
      const x = index
        ? targets[index - 1].getBBox().width +
          width +
          this.innerOptions.margin * index
        : 0;
      return `translate(${-x}, 0)`;
    });

    this.legendRectCt
      .attr('width', (_, index, target) => getParentNode(index, target).width)
      .attr(
        'height',
        (_, index, target) => getParentNode(index, target).height || 0,
      )
      .attr(
        'y',
        (_, index, target) => -(getParentNode(index, target).height / 3),
      )
      .attr(
        'x',
        (_, index, target) => -(getParentNode(index, target).width / 2),
      )
      .attr('opacity', 0);
  }
}

function getParentNode(
  index: number,
  target: ArrayLike<SVGRectElement> | SVGRectElement[],
) {
  return (target[index].parentNode as SVGRectElement).getBBox();
}
