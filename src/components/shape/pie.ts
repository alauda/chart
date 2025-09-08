import { select } from 'd3';
import * as d3 from 'd3';

import { ChartEvent } from '../../types/index.js';
import { Data, PieShapeOption } from '../../types/options.js';
import {
  createSvg,
  generateName,
  getChartColor,
  PolarShapeType,
  template,
} from '../../utils/index.js';
import { Tooltip } from '../tooltip.js';

import { PolarShape } from './index.js';
import { get, isFunction, isNumber } from 'lodash-es';
import { Legend } from '../legend.js';

export const DEFAULT_RADIUS_DIFF = 8;
export const ACTIVE_RADIUS_ENLARGE_SIZE = 2;

interface PieItemConfig {
  padAngle: number;
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
  polylinePoints?: [number, number][];
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
    return this.data.every(d => !isNumber(d.value));
  }

  get totalValue() {
    return this.data.reduce((prev, item) => prev + item.value, 0);
  }

  get colorVar() {
    return this.ctrl.getTheme().colorVar;
  }

  init() {
    // do nothing.
}

  render() {
    this.ctrl.container.style.display = 'flex';
    this.ctrl.container.style.flexDirection = 'column';
    this.option = get(this.ctrl.getOption(), this.type, {});
    this.svgEl = this.svgEl || createSvg(select(this.ctrl.container));
    this.container = this.container || this.svgEl.append('g');
    const legendRef = this.ctrl.components.get('legend') as Legend;
    const { clientHeight } = this.ctrl.container;
    this.ctrl.emit(ChartEvent.U_PLOT_READY);
    requestAnimationFrame(() => {
      const legendEl = this.ctrl.chartContainer.querySelector(
        `.${generateName('legend')}`,
      );
      const position: string = get(
        this.ctrl.getOption().legend,
        'position',
        '',
      );
      const legendH = position.includes('bottom') ? legendEl?.clientHeight : 0;
      const headerH =
        this.ctrl.chartContainer.querySelector(`.${generateName('header')}`)
          ?.clientHeight || 0;
      const height = clientHeight - legendH - headerH;
      this.renderPie(height);
      this.renderLabel();
      this.ctrl.on(ChartEvent.LEGEND_ITEM_CLICK, () => {
        this.data = this.getData().filter(
          d => !legendRef.inactivatedSet.has(d.name),
        );
        this.renderPie(height);
        this.renderLabel();
      });
    });
  }

  calculateLabelLength(data: any) {
    let labelText = '';
    if (!this.option?.labelLine?.labels) {
      return 0;
    }
    const percent = +((data.value / this.totalValue || 0) * 100).toFixed(2);
    if (this.option.labelLine.labels.includes('name')) {
      labelText += data.name;
    }
    if (this.option.labelLine.labels.includes('value')) {
      labelText += `${labelText ? ': ' : ''}${data.value}`;
    }
    if (this.option.labelLine.labels.includes('percent')) {
      labelText += `  ${percent}%`;
    }
    const formatter = this.option.labelLine.formatter;
    if (formatter) {
      labelText = isFunction(formatter)
        ? formatter(data, percent)
        : template(formatter, {
            data,
            percent,
          });
    }
    return labelText.length;
  }

  renderPie(clientHeight: number) {
    const { clientWidth } = this.svgEl.node()!;
    let radius =
      Math.min(clientWidth, clientHeight) / 2 - ACTIVE_RADIUS_ENLARGE_SIZE;

    // 动态调整半径以确保引导线和标签不会超出屏幕
    const maxLabelLength = this.calculateLabelLength(this.data);
    const labelSpace = Math.min(maxLabelLength * 8, clientWidth / 2); // 假设每个字符占8个像素，可以根据实际情况调整
    const maxRadius = Math.min(
      clientWidth / 2 - labelSpace,
      clientHeight / 2 - (this.option?.labelLine?.labels?.length ?  clientHeight / 5: 10),
    ); // 动态调整高度
    radius = Math.min(radius, maxRadius);

    const paths = calculatePaths(
      this.data,
      {
        ...this.option,
        outerRadius: radius,
        backgroundColor: this.nullData
          ? this.colorVar['n-8']
          : this.option?.backgroundColor || this.colorVar['n-8'],
      },
      this.colorVar['n-8'],
    );

    this.container.selectAll('path').remove();
    this.container
      .attr('transform', `translate(${clientWidth / 2},${clientHeight / 2})`)
      .selectAll('path')
      .data(paths)
      .join('path')
      .attr('fill', e => e.config.color)
      .attr('d', e => e.path);

    this.addListener();
    this.renderGuidelines(paths);
  }

  renderGuidelines(paths: any) {
    this.container.selectAll('.guideline-group').remove();
    if (
      !this.option?.labelLine?.show ||
      this.nullData ||
      !this.option?.labelLine?.labels?.length
    ) {
      return;
    }
    const guidelineGroup = this.container
      .selectAll('.guideline-group')
      .data([null]);
    guidelineGroup.enter().append('g').attr('class', 'guideline-group');
    const guidelines = this.container
      .select('.guideline-group')
      .selectAll('.guideline')
      .data(paths.filter((d: any) => d.data));

    const arcGenerator = d3.arc();
    guidelines
      .join('path')
      .attr('class', 'guideline')
      .attr('fill', 'none')
      .attr('stroke', (d: any) => d.config.color)
      .attr('d', (d: any) => {
        const [x, y] = arcGenerator.centroid({
          innerRadius: d.config.outerRadius,
          outerRadius: d.config.outerRadius,
          startAngle: d.config.startAngle,
          endAngle: d.config.endAngle,
        });
        const labelX = x * 1.1;
        const labelY = y * 1.1;
        const endX = labelX + (labelX > 0 ? 20 : -20);

        return `M${x},${y}L${labelX},${labelY}L${endX},${labelY}`;
      });

    // 添加文本标签
    const labels = this.container
      .select('.guideline-group')
      .selectAll('.label')
      .data(paths.filter((d: any) => d.data));

    labels
      .join('text')
      .attr('class', 'label')
      .attr('x', (d: any) => {
        const [x] = arcGenerator.centroid({
          innerRadius: d.config.outerRadius,
          outerRadius: d.config.outerRadius,
          startAngle: d.config.startAngle,
          endAngle: d.config.endAngle,
        });
        return x * 1.1 + (x > 0 ? 20 : -20);
      })
      .attr('dy', '0.35em') // 垂直居中对齐
      .attr('y', (d: any) => {
        const [, y] = arcGenerator.centroid({
          innerRadius: d.config.outerRadius,
          outerRadius: d.config.outerRadius,
          startAngle: d.config.startAngle,
          endAngle: d.config.endAngle,
        });
        const yOffset = 0; // 定义一个偏移量，根据需要调整
        return y * 1.1 - yOffset; // 将标签向上移动以放置在引导线的垂直居中上方
      })
      .attr('text-anchor', (d: any) => {
        const [x] = arcGenerator.centroid({
          innerRadius: d.config.outerRadius,
          outerRadius: d.config.outerRadius,
          startAngle: d.config.startAngle,
          endAngle: d.config.endAngle,
        });
        return x > 0 ? 'start' : 'end';
      })
      .text((d: any) => {
        let labelText = '';
        const percent = +((d.data.value / this.totalValue || 0) * 100).toFixed(
          2,
        );
        if (this.option.labelLine.labels.includes('name')) {
          labelText += d.data.name;
        }
        if (this.option.labelLine.labels.includes('value')) {
          labelText += `${labelText ? ': ' : ''}${d.data.value}`;
        }
        if (this.option.labelLine.labels.includes('percent')) {
          labelText += `  ${percent}%`;
        }
        const formatter = this.option.labelLine.formatter;
        if (formatter) {
          labelText = isFunction(formatter)
            ? formatter(d.data, percent)
            : template(formatter, {
                data: d.data,
                percent,
              });
        }
        return labelText;
      });
  }

  onMousemove(res: { self: unknown; data: PieItemValue; event: MouseEvent }) {
    const item = res.data;
    const path = getPath({
      ...item.config,
      padAngle: item.config.padAngle,
      innerRadius: item.config.innerRadius,
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

  redraw() {}
}

export function getPath(config: {
  padAngle: number;
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
    .padAngle(config.padAngle || (config.borderWidth * Math.PI) / 180);
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

  const { outerRadius, innerRadius } = getRadius({
    ...option,
    innerRadius:
      data.length === 1 && !option.innerRadius
        ? 0
        : option.innerRadius || option.padAngle - 0.01,
  });

  const { borderRadius = 2, borderWidth = 0 } = option?.itemStyle || {};
  const arc = d3
    .arc()
    .cornerRadius(borderRadius)
    .padAngle(data.length === 1 ? 0 : option.padAngle || 0);

  let accumulate = startAngle;
  const baseConfig: Partial<PieItemConfig> = {
    padAngle: data.length === 1 || !data?.length ? 0 : option.padAngle || 0,
    innerRadius,
    outerRadius,
    borderRadius,
    borderWidth,
  };
  const padding = 14;
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
            color,
            startAngle,
            endAngle,
            ...baseConfig,
          },
        },
      ]
    : [];
  return angles.reduce(
    (acc, curr, ind) => {
      const startAngle = accumulate;
      const endAngle = accumulate + angles[ind];

      const midAngle = (startAngle + endAngle) / 2;
      const x1 = Math.cos(midAngle) * outerRadius;
      const y1 = Math.sin(midAngle) * outerRadius;
      const x2 = Math.cos(midAngle) * (outerRadius + 10);
      const y2 = Math.sin(midAngle) * (outerRadius + 10);
      const x3 = x2 + (midAngle < Math.PI ? 1 : -1) * 50;

      const polylinePoints = [
        [x1, y1],
        [x2, y2],
        [x3, y2],
      ];

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
            ...baseConfig,
          },
          data: data[ind],
          polylinePoints, // Add polyline points
        },
      ];
      accumulate += curr;
      return result;
    },
    [
      {
        path: arc({
          innerRadius: 0,
          outerRadius,
          startAngle: option.startAngle || startAngle,
          endAngle: option.endAngle || endAngle,
        })!,
        config: {
          color: option.backgroundColor || 'transparent',
          ...baseConfig,
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
    innerRadius = outerRadius - DEFAULT_RADIUS_DIFF;
  }
  if (!outerRadius) {
    outerRadius = innerRadius + DEFAULT_RADIUS_DIFF;
  }
  return {
    outerRadius: outerRadius,
    innerRadius,
  };
}
