import { select } from 'd3';
import * as d3 from 'd3';
import { Data, PieShapeOption } from '../../types/options.js';
import { createSvg, getChartColor, PolarShapeType } from '../../utils/index.js';

import { PolarShape } from './index.js';
import { ChartEvent } from '../../types/index.js';
import { Tooltip } from '../tooltip.js';
import { LegendItem } from '../legend.js';

export const DEFAULT_RADIUS_DIFF = 8;
export const ACTIVE_RADIUS_ENLARGE_SIZE = 2;

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
  data: Data;
  selected?: boolean;
}

/**
 * Pie 饼图 环形图
 */
export default class Pie extends PolarShape<PieShapeOption> {
  override type = PolarShapeType.Pie;

  pieGuide!: d3.Selection<HTMLDivElement, unknown, null, undefined>;
  svgEl: d3.Selection<SVGSVGElement, unknown, null, undefined>;

  data = this.getData();

  get nullData() {
    return this.data.every(d => !d.value);
  }

  get colorVar() {
    return this.ctrl.getTheme().colorVar;
  }

  init() {}

  render() {
    this.svgEl = this.svgEl || createSvg(select(this.ctrl.container));
    this.container = this.container || this.svgEl.append('g');
    this.renderPie();
    this.renderLabel();

    this.ctrl.on(ChartEvent.LEGEND_ITEM_CLICK, res => {
      const names: string[] = res.data.reduce(
        (pre: string[], cur: LegendItem) => [
          ...pre,
          ...(cur.isActive ? [cur.name] : []),
        ],
        [],
      );
      this.data = this.getData().filter(d => names.includes(d.name));
      this.renderPie();
      this.renderLabel();
    });
  }

  renderPie() {
    const { clientWidth, clientHeight } = this.svgEl.node()!;
    const paths = calculatePaths(
      this.data,
      {
        ...this.option,
        outerRadius:
          this.option.outerRadius ??
          clientHeight / 2 - ACTIVE_RADIUS_ENLARGE_SIZE,
        backgroundColor: this.nullData
          ? this.colorVar['n-8']
          : this.option.backgroundColor,
      },
      this.colorVar['n-8'],
    );

    this.container
      .attr('transform', `translate(${clientWidth / 2},${clientHeight / 2})`)
      .selectAll('path')
      .data(paths)
      .join('path')
      .attr('fill', e => e.config.color)
      .attr('d', e => e.path);
    this.addListener();
  }

  onMousemove(res: { self: unknown; data: PieItemValue; event: MouseEvent }) {
    const item = res.data;
    const path = getPath({
      ...item.config,
      innerRadius: item.config.innerRadius - ACTIVE_RADIUS_ENLARGE_SIZE,
      outerRadius: item.config.outerRadius + ACTIVE_RADIUS_ENLARGE_SIZE,
      borderWidth: item.config.borderWidth - ACTIVE_RADIUS_ENLARGE_SIZE,
    });
    d3.select(res.self as any)
      .attr('opacity', 0.9)
      .transition()
      .attr('d', path);
  }

  onMouseleave(res: { self: unknown; data: PieItemValue; event: MouseEvent }) {
    const item = res.data;
    d3.select(res.self as any)
      .attr('opacity', 1)
      .transition()
      .attr('d', getPath(item.config));
  }

  addListener() {
    const pieItems = (
      this.container.selectAll('path') as d3.Selection<
        any,
        {
          path: string;
          config: PieItemConfig;
          data: Data;
        },
        any,
        any
      >
    ).filter(function (e) {
      return !!e.data;
    });
    const ctrl = this.ctrl;
    pieItems
      .on('mouseover', function (event: MouseEvent, data) {
        ctrl.emit(ChartEvent.ELEMENT_MOUSEMOVE, {
          self: this as unknown,
          event,
          data,
        });
        if (!ctrl.hideTooltip) {
          ctrl.emit(ChartEvent.U_PLOT_SET_CURSOR, {
            anchor: event.target,
            values: [data.data],
          });
          (ctrl.components.get('tooltip') as Tooltip).showTooltip();
        }
      })
      .on('mouseout', function (event: MouseEvent, data) {
        ctrl.emit(ChartEvent.ELEMENT_MOUSELEAVE, {
          self: this as unknown,
          event,
          data,
        });
        if (!ctrl.hideTooltip) {
          (ctrl.components.get('tooltip') as Tooltip).hideTooltip();
        }
      });
  }

  renderLabel() {
    if (this.option.label) {
      const { x = 0, y = 0 } = this.option.label.position || {};
      if (!this.pieGuide) {
        this.pieGuide = select(this.ctrl.container)
          .append('div')
          .style('position', 'absolute');
      }
      if (this.option.label.text) {
        this.pieGuide.html(this.option.label.text);
      }
      this.pieGuide
        .style('top', `calc(50% + ${x}px`)
        .style('left', `calc(50% + ${y}px`)
        .style('transform', 'translate(-50%, -50%)');
    }
  }
}

export function getPath(config: {
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

export function calculatePaths(
  data: Data,
  option: PieShapeOption,
  color: string,
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

  const { outerRadius, innerRadius } = getRadius(option);

  const { borderRadius = 2, borderWidth = 0 } = option?.itemStyle || {};
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
  const padding = 14
  const innerDisc = option.innerDisc
    ? [
        {
          path: arc({
            innerRadius: innerRadius - padding,
            outerRadius: innerRadius - padding - 4,
            startAngle,
            endAngle,
          })!,
          config: {
            color: color,
            startAngle,
            endAngle,
            ...baseConifg,
          },
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
          startAngle: option.startAngle || startAngle,
          endAngle: option.endAngle || endAngle,
        })!,
        config: {
          color: option.backgroundColor || 'transparent',
          ...baseConifg,
          startAngle: option.startAngle || startAngle,
          endAngle: option.endAngle || endAngle,
        },
        data: null,
      },
      ...innerDisc,
    ],
  );
}

export function getRadius(option: PieShapeOption) {
  let outerRadius = option.outerRadius;
  let innerRadius = outerRadius * option.innerRadius || 0;
  if (!outerRadius && !innerRadius) {
    throw new Error('Either outerRadius or innerRadius is required!');
  }
  if (!innerRadius && innerRadius !== 0) {
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
