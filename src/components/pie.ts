import * as d3 from 'd3';

import { UIController } from '../abstract';
import { View } from '../chart/view';
import { PIE_EVENTS, CLASS_NAME } from '../constant';
import { ChartData, PieSeriesOption } from '../types';
import { getChartColor, isPercentage, rgbColor } from '../utils';

const DEFAULT_RADIUS_DIFF = 8;
const ACTIVE_RADIUS_ENLARGE_SIZE = 4;
// const SELECT_OFFSET = 4;

interface PieItemConfig {
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  borderRadius: number;
  borderWidth: number;
  color: string;
}

interface PieItemValue {
  path: string;
  config: PieItemConfig;
  data: ChartData;
  selected?: boolean;
}

export class Pie extends UIController<PieSeriesOption> {
  get name() {
    return 'pie';
  }

  override option: PieSeriesOption;
  container!: d3.Selection<SVGGElement, any, any, any>;

  pieGuide!: d3.Selection<HTMLDivElement, unknown, null, undefined>;

  constructor(owner: View) {
    super(owner);
    this.option = (owner.options.seriesOption || {}) as PieSeriesOption;
  }

  init() {
    this.container = this.owner.chartEle.svg.append('g');
  }

  get nullData() {
    return this.owner.chartData.every(d => !d.value);
  }

  render() {
    this.update();
    this.owner.on(
      PIE_EVENTS.ITEM_HOVERED,
      (res: { self: unknown; data: PieItemValue; event: MouseEvent }) => {
        const item = res.data;
        const path = getPath({
          ...item.config,
          innerRadius: item.config.innerRadius - ACTIVE_RADIUS_ENLARGE_SIZE / 2,
          outerRadius: item.config.outerRadius + ACTIVE_RADIUS_ENLARGE_SIZE / 2,
        });
        d3.select(res.self as any)
          .attr('opacity', 0.9)
          .transition()
          .attr('d', path);
      },
    );

    this.owner.on(
      PIE_EVENTS.ITEM_MOUSEOUT,
      (res: { self: unknown; data: PieItemValue; event: MouseEvent }) => {
        const item = res.data;
        d3.select(res.self as any)
          .attr('opacity', 1)
          .transition()
          .attr('d', getPath(item.config));
      },
    );
  }

  update() {
    this.option = (this.owner.options.seriesOption || {}) as PieSeriesOption;
    this.renderLabel();
    this.updatePie();
  }

  updatePie() {
    const paths = calculatePaths(
      this.owner.chartData,
      {
        ...this.option,
        backgroundColor: this.nullData
          ? rgbColor('n-8')
          : this.option.backgroundColor,
      },
      this.owner.size.main.width,
    );

    const { clientWidth, clientHeight } = this.owner.chartEle.svg.node()!;
    this.container
      .attr('transform', `translate(${clientWidth / 2},${clientHeight / 2})`)
      .selectAll('path')
      .data(paths)
      .join('path')
      .attr('fill', e => e.config.color)
      .attr('d', e => e.path);
    const owner = this.owner;
    const tooltip = this.owner.getController('tooltip');

    tooltip?.mountPaths(
      this.container.selectAll('path'),
      this.owner.chartEle.main,
    );
    const pieItems = (
      this.container.selectAll('path') as d3.Selection<
        any,
        {
          path: string;
          config: PieItemConfig;
          data: ChartData;
        },
        any,
        any
      >
    ).filter(function (e) {
      return !!e.data;
    });

    // pieItems.on('click', function (event: MouseEvent, res: PieItemValue) {
    //   console.log(res, event)
    //   owner.emit(PIE_EVENTS.ITEM_CLICK, res);
    //   // const item = res.data;
    //   const path = getPath({
    //     ...res.config,
    //     innerRadius: res.config.innerRadius + SELECT_OFFSET,
    //     outerRadius: res.config.outerRadius + SELECT_OFFSET,
    //   });
    //   d3.select(this)
    //     .attr('opacity', 0.9)
    //     .transition()
    //     .attr('d', path);
    // });

    if (!tooltip || this.owner.options.tooltip?.trigger === 'none') {
      pieItems
        .on('mouseover', function (event: MouseEvent, data) {
          owner.emit(PIE_EVENTS.ITEM_HOVERED, {
            self: this as unknown,
            event,
            data,
          });
        })
        .on('mouseout', function (event: MouseEvent, data) {
          owner.emit(PIE_EVENTS.ITEM_MOUSEOUT, {
            self: this as unknown,
            event,
            data,
          });
        });
    }
  }

  renderLabel() {
    if (this.option.label) {
      const { x, y } = this.option.label.position;
      if (!this.pieGuide) {
        this.pieGuide = this.owner.chartEle.chart
          .append('div')
          .attr('class', CLASS_NAME.pieGuide)
          .style('position', 'absolute');
      }
      if (this.option.label.text) {
        this.pieGuide.html(this.option.label.text);
      }
      this.pieGuide
        .style('top', x)
        .style('left', y)
        .style('transform', 'translate(-50%, -50%)');
    }
  }

  destroy(): void {
    this.container.remove();
  }
}

// path
function getPath(config: {
  startAngle: number;
  endAngle: number;
  innerRadius: number;
  outerRadius: number;
  borderRadius: number;
  borderWidth: number;
  color: string;
}) {
  const arc = d3
    .arc()
    .cornerRadius(config.borderRadius)
    .padAngle((config.borderWidth * Math.PI) / 180);
  return arc({
    innerRadius: config.innerRadius,
    outerRadius: config.outerRadius,
    startAngle: config.startAngle,
    endAngle: config.endAngle,
  });
}

function calculatePaths(
  data: ChartData[],
  option: PieSeriesOption,
  ownerWidth: number,
) {
  const rawTotal = data.reduce((acc, curr) => acc + curr.value, 0);
  const total = Math.max(option.total || 0, rawTotal);
  const startAngle = (option.startAngle || 0) % (2 * Math.PI);
  const endAngle = (option.endAngle || 0) % (2 * Math.PI) || 2 * Math.PI;

  const diffAngle =
    endAngle < startAngle
      ? ((endAngle - startAngle) % (2 * Math.PI)) + 2 * Math.PI
      : endAngle - startAngle;
  const angles = data.map(data => (data.value / total || 0) * diffAngle);

  const { outerRadius, innerRadius } = getRadius(option, ownerWidth);

  const { borderRadius = outerRadius - innerRadius, borderWidth = 1.5 } =
    option?.itemStyle || {};

  const arc = d3
    .arc()
    .cornerRadius(borderRadius)
    .padAngle((borderWidth * Math.PI) / 180);

  let accumulate = startAngle;
  const baseConifg: Partial<PieItemConfig> = {
    innerRadius,
    outerRadius,
    borderRadius,
    borderWidth,
  };

  const innerDisc = option.innerDisc
    ? [
        {
          path: arc({
            innerRadius: innerRadius - 10,
            outerRadius: outerRadius - 16.5,
            startAngle,
            endAngle,
          })!,
          config: {
            color: rgbColor('n-8'),
            startAngle,
            endAngle,
            ...baseConifg,
          },
          data: {},
        },
      ]
    : [];

  return angles.reduce(
    (acc, curr, ind) => {
      const startAngle = accumulate;
      const endAngle = accumulate + angles[ind];
      const result = [
        ...acc,
        {
          path: arc({
            innerRadius,
            outerRadius,
            startAngle,
            endAngle,
          })!,
          config: {
            color: data[ind].color || getChartColor(ind)!,
            startAngle,
            endAngle,
            ...baseConifg,
          },
          data: data[ind],
        },
      ];
      accumulate += curr;
      return result;
    },
    [
      {
        path: arc({
          innerRadius,
          outerRadius,
          startAngle,
          endAngle,
        })!,
        config: {
          color: option.backgroundColor || 'transparent',
          startAngle,
          endAngle,
          ...baseConifg,
        },
        data: {},
      },
      ...innerDisc,
    ],
  );
}

function getRadius(option: PieSeriesOption, containerWidth: number) {
  let outerRadius =
    option.outerRadius && isPercentage(option.outerRadius)
      ? (containerWidth * parseFloat(option.outerRadius)) / 200
      : option.outerRadius;
  let innerRadius =
    option.innerRadius && isPercentage(option.innerRadius)
      ? (containerWidth * parseFloat(option.innerRadius)) / 200
      : option.innerRadius;
  if (!outerRadius && !innerRadius) {
    throw new Error('Either outerRadius or innerRadius is required!');
  }
  if (!innerRadius) {
    innerRadius = (outerRadius as number) - DEFAULT_RADIUS_DIFF;
  }
  if (!outerRadius) {
    outerRadius = (innerRadius as number) + DEFAULT_RADIUS_DIFF;
  }
  return {
    outerRadius: outerRadius as number,
    innerRadius: innerRadius as number,
  };
}
