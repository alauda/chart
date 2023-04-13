import { select } from 'd3';
import * as d3 from 'd3';
import { GaugeShapeOption, PieShapeOption } from '../../types/index.js';
import { createSvg, getChartColor, PolarShapeType } from '../../utils/index.js';
import { PolarShape } from './index.js';
import { ACTIVE_RADIUS_ENLARGE_SIZE, getRadius } from './pie.js';
import { measureText } from '../../strategy/utils.js';
import { isFunction } from 'lodash';
const START_ANGLE = -(Math.PI / 1.5);
const END_ANGLE = Math.PI / 1.5;

/**
 * Gauge
 */
export default class Gauge extends PolarShape<GaugeShapeOption> {
  override type = PolarShapeType.Gauge;

  pieGuide!: d3.Selection<HTMLDivElement, unknown, null, undefined>;
  svgEl: d3.Selection<SVGSVGElement, unknown, null, undefined>;

  data = this.getData();

  get nullData() {
    return this.data.every(d => !d.value);
  }

  get colorVar() {
    return this.ctrl.getTheme().colorVar;
  }
  startAngle = -(Math.PI / 1.5);
  endAngle = Math.PI / 1.5;

  init() {}

  render() {
    this.svgEl = this.svgEl || createSvg(select(this.ctrl.container));
    this.container = this.container || this.svgEl.append('g');
    this.renderPie();
    this.renderLabel();
    this.renderText();
  }

  renderText() {
    if (this.option?.text?.show !== false) {
      const { color, size = 12 } = this.option.text;
      const majorTicks = 5;
      const scale = d3.scaleLinear().range([0, 1]).domain([0, 100]);
      const labelInset = 0;
      const ticks = scale.ticks(majorTicks);
      const { clientHeight } = this.svgEl.node()!;
      const minAngle = (this.startAngle * 180) / Math.PI;
      const maxAngle = (this.endAngle * 360) / Math.PI;
      const spacing = 2;
      const r = clientHeight / 2 + spacing;
      var lg = this.container
        .append('g')
        .attr('class', 'label')
        .attr('transform', `translate(${0},${0})`);
      lg.selectAll('text')
        .data(ticks)
        .enter()
        .append('text')
        .attr('font-size', size)
        .attr('transform', function (d, i, v) {
          var ratio = scale(d);
          const { width } = measureText(String(d));
          var newAngle = minAngle + ratio * maxAngle;
          const angle = v.length - 1 === i ? newAngle - (width - 4) : newAngle;
          return 'rotate(' + angle + ') translate(0,' + (labelInset - r) + ')';
        })
        .attr('fill', (value: number) => {
          if (isFunction(color)) {
            return color(value);
          }
          return color || this.colorVar['n-4'];
        })
        .text(v => v);
    }
  }

  renderPie() {
    const { clientWidth, clientHeight } = this.svgEl.node()!;
    const colors = this.option.colors.reduce((pre, cur, index, arr) => {
      const value = index ? cur[0] - arr[index - 1][0] : cur[0];
      return [...pre, [parseFloat(value.toFixed(2)), cur[1]]];
    }, []);
    const data =
      colors?.map(([value, color]) => ({
        name: color,
        color,
        value,
      })) || [];

    const colorPaths = calculatePaths(
      data,
      {
        ...this.option,
        startAngle: this.startAngle,
        endAngle: this.endAngle,
        itemStyle: {
          borderRadius: 0,
          borderWidth: 0,
        },
        innerRadius: 0.95,
        outerRadius:
          this.option.outerRadius ??
          clientHeight / 2 - ACTIVE_RADIUS_ENLARGE_SIZE,
        backgroundColor: this.colorVar['n-8'],
      },
      this.colorVar['n-8'],
    );
    const outerRadius =
      this.option.outerRadius ?? clientHeight / 2 - ACTIVE_RADIUS_ENLARGE_SIZE;
    const innerRadius = this.option?.innerRadius || 0.8;
    const r = (END_ANGLE * 180) / Math.PI;
    const padding = (clientHeight - r) / 2;
    const valuePaths = calculatePaths(
      this.ctrl.getData() as any,
      {
        ...this.option,
        total: 100,
        startAngle: START_ANGLE,
        endAngle: END_ANGLE,
        itemStyle: {
          borderRadius: 0,
          borderWidth: 0,
        },
        innerRadius,
        outerRadius: outerRadius - 6,
        backgroundColor: this.colorVar['n-8'],
      },
      this.colorVar['n-8'],
    );

    this.container
      .attr(
        'transform',
        `translate(${clientWidth / 2},${clientHeight / 2 + padding})`,
      )
      .selectAll('path')
      .data([...colorPaths, ...valuePaths])
      .join('path')
      .attr('fill', e => e.config.color)
      .attr('d', e => e.path);
  }

  renderLabel() {
    if (this.option.label) {
      const { clientHeight } = this.svgEl.node()!;
      const r = (END_ANGLE * 180) / Math.PI;
      const padding = (clientHeight - r) / 2;
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
        .style('left', `calc(50% + ${x ?? 0}px`)
        .style('top', `calc(50% + ${padding}px + ${y}px`)
        .style('transform', 'translate(-50%, -50%)');
    }
  }
}

function calculatePaths(
  data: Array<{ color: string; value: number; values?: any }>,
  option: PieShapeOption,
  color: string,
) {
  const total = option.total ?? data.reduce((acc, curr) => acc + curr.value, 0);
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
  const baseConifg: Partial<any> = {
    innerRadius,
    outerRadius,
    borderRadius,
    borderWidth,
  };
  const innerDisc = option.innerDisc
    ? [
        {
          path: arc({
            innerRadius: innerRadius,
            outerRadius: innerRadius - 4,
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
