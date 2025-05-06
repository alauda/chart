import { select } from 'd3';
import * as d3 from 'd3';
import { get, isFunction } from 'lodash-es';

import { measureText } from '../../strategy/utils.js';
import { Data, GaugeShapeOption, PieShapeOption } from '../../types/index.js';
import {
  createSvg,
  getChartColor,
  PolarShapeType,
  template,
} from '../../utils/index.js';

import { getRadius } from './pie.js';

import { PolarShape } from './index.js';

const START_ANGLE = -(Math.PI / 1.5);
const END_ANGLE = Math.PI / 1.5;

/**
 * Gauge
 */
export default class Gauge extends PolarShape<GaugeShapeOption> {
  override type = PolarShapeType.Gauge;

  pieGuide!: d3.Selection<SVGTextElement, unknown, null, undefined>;
  pieDescription!: d3.Selection<SVGTextElement, unknown, null, undefined>;

  svgEl: d3.Selection<SVGSVGElement, unknown, null, undefined>;

  data = this.getData();

  get nullData() {
    return this.data.every(d => !d.value);
  }

  get colorVar() {
    return this.ctrl.getTheme().colorVar;
  }

  get total() {
    return this.getData().reduce((pre, cur) => (cur.value || 0) + pre, 0);
  }

  get max() {
    return Math.max(this.option?.max || 100, this.total);
  }

  startAngle = -(Math.PI / 1.5);
  endAngle = Math.PI / 1.5;
  init() {
    // do nothing.
  }

  render() {
    this.option = get(this.ctrl.getOption(), this.type);
    this.svgEl = this.svgEl || createSvg(select(this.ctrl.container));
    this.container = this.container || this.svgEl.append('g');
    this.renderPie();
    requestAnimationFrame(() => {
      this.renderText();
      this.renderLabel();
    });
  }

  renderText() {
    if (this.option?.text?.show !== false && this.option?.text) {
      const { color, size = 12 } = this.option?.text;
      const majorTicks = 5;
      const scale = d3.scaleLinear().range([0, 1]).domain([0, 100]);
      const labelInset = 0;
      const ticks = scale.ticks(majorTicks);
      const { clientHeight } = this.svgEl.node()!;
      const minAngle = (this.startAngle * 180) / Math.PI;
      const maxAngle = (this.endAngle * 360) / Math.PI;
      const spacing = 2;
      const r = clientHeight / 2 + spacing;
      const lg = this.container
        .append('g')
        .attr('class', 'label')
        .attr('transform', `translate(${0},${0})`);
      lg.selectAll('text')
        .data(ticks)
        .enter()
        .append('text')
        .attr('font-size', size)
        .attr('transform', function (d, i, v) {
          const ratio = scale(d);
          const { width } = measureText(String(d));
          const newAngle = minAngle + ratio * maxAngle;
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
    const radius = Math.min(clientWidth, clientHeight) / 2;
    if (!clientWidth && !clientHeight) {
      return;
    }
    const colors = this?.option?.colors
      ?.sort((a, b) => b[0] - a[0])
      ?.reduce((pre, cur) => {
        const value =
          Math.max(this.max - cur[0], 0) - pre.reduce((p, c) => p + c[0], 0);
        return [...pre, [parseFloat(value.toFixed(2)), cur[1]]];
      }, []);

    const data =
      colors?.reverse()?.map(([value, color]) => ({
        name: color,
        color,
        value,
      })) || [];

    const colorPaths = data.length
      ? calculatePaths(
          data,
          {
            ...(this.option as any),
            startAngle: this.startAngle,
            endAngle: this.endAngle,
            itemStyle: {
              borderRadius: 0,
              borderWidth: 0,
            },
            innerRadius: 0.95,
            outerRadius: this.option?.outerRadius ?? radius,
            backgroundColor: this.colorVar['n-8'],
          },
          this.colorVar['n-8'],
        )
      : [];
    const outerRadius = this.option?.outerRadius ?? radius;
    const innerRadius = this.option?.innerRadius || 0.85;
    // const r = (END_ANGLE * 180) / Math.PI;
    // const padding = 8;
    // const padding = (clientHeight - r) / 2;
    const values = this.ctrl.getData().map(item => ({
      ...item,
      color:
        this.handlePieColor(
          item.value,
          this?.option?.colors?.sort((a, b) => b[0] - a[0]) || [],
        ) || item.color,
    }));
    const valuePaths = calculatePaths(
      values as any,
      {
        ...(this.option as any),
        total: this.option?.max || 100,
        startAngle: START_ANGLE,
        endAngle: END_ANGLE,
        itemStyle: {
          borderRadius: 0,
          borderWidth: 0,
        },
        innerRadius,
        outerRadius: outerRadius - radius * 0.08,
        backgroundColor: this.colorVar['n-8'],
      },
      this.colorVar['n-8'],
      0.01,
    );
    this.container
      .attr('transform', `translate(${clientWidth / 2},${0})`)
      .selectAll('path')
      .data([...colorPaths, ...valuePaths])
      .join('path')
      .attr('fill', e => e.config.color)
      .attr('d', e => e.path);
    requestAnimationFrame(() => {
      const { height } = this.container.node().getBBox();
      const ww = Math.min(clientWidth, clientHeight);
      const cH = ww < height ? 0 : (ww - height) / 2;
      this.container.attr(
        'transform',
        `translate(${clientWidth / 2},${height - cH})`,
      );
    });
  }

  handlePieColor(value: number, colors: Array<[number, string]>) {
    for (const item of colors) {
      if (value >= item[0] && item[0] !== null) {
        return item[1];
      }
    }
    return '';
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  renderLabel() {
    if (this.option?.label) {
      const { colors } = this.option;
      const { text, description, position, textStyle, descriptionStyle } =
        this.option?.label;
      const isColors = !!colors?.length;

      if (!this.pieGuide) {
        this.pieGuide = this.svgEl.append('text');
      }
      if (!this.pieDescription) {
        this.pieDescription = this.svgEl.append('text');
      }

      const { clientWidth, clientHeight } = this.svgEl.node()!;
      const { height } = this.container.node().getBBox();
      const ww = Math.min(clientWidth, clientHeight);
      const cH = ww < height ? 0 : (ww - height) / 2;
      const textColor =
        textStyle?.color || this.ctrl.getTheme().gauge.textColor;
      const descriptionColor =
        descriptionStyle?.color || this.ctrl.getTheme().gauge.descriptionColor;
      if (description) {
        const centerDesc = this.pieDescription
          .attr('class', 'centerText')
          .attr('text-anchor', 'middle')
          .attr('x', clientWidth / 2 + (position?.x || 0))
          .attr('y', ww - cH + (position?.y || 0) + cH / (isColors ? 1.2 : 5))
          .attr('stroke', descriptionColor)
          .attr('fill', descriptionColor);
        const fontSize = Math.min(clientWidth, clientHeight) / 15;
        const data = this.getData();
        const str = isFunction(description)
          ? (description as (data: Data) => string)(data)
          : template(description, { data });
        centerDesc.style('font-size', fontSize + 'px')
          .text(this.truncateText(str, fontSize, clientWidth * 0.8));
      }
      if (text) {
        const centerText = this.pieGuide
          .attr('class', 'centerText')
          .attr('text-anchor', 'middle')
          .attr('x', clientWidth / 2 + (position?.x || 0))
          .attr('y', ww - cH + (position?.y || 0) + (isColors ? 0 : -(cH / 2)))
          .attr('stroke', textColor)
          .attr('fill', textColor);
        const fontSize = Math.min(clientWidth, clientHeight) / 8;
        const data = this.getData();
        const str = isFunction(text)
          ? text(data, this.total)
          : template(text, { value: this.total, data }) || text;
        centerText.style('font-size', fontSize + 'px')
          .text(this.truncateText(str, fontSize, clientWidth * 0.8));
      }
    }
  }

  /**
   * 截断文本并添加省略号
   * @param text 原始文本
   * @param fontSize 字体大小
   * @param maxWidth 最大宽度
   * @returns 处理后的文本
   */
  truncateText(text: string, fontSize: number, maxWidth: number): string {
    if (!text) return '';
    
    const { width } = measureText(text, fontSize);
    if (width <= maxWidth) return text;
    
    // 如果文本宽度超过最大宽度，则进行截断
    const ellipsis = '...';
    const ellipsisWidth = measureText(ellipsis, fontSize).width;
    let truncatedText = text;
    let truncatedWidth = width;
    
    // 逐个字符截断直到文本宽度小于最大宽度
    while (truncatedWidth > maxWidth - ellipsisWidth && truncatedText.length > 0) {
      truncatedText = truncatedText.slice(0, -1);
      truncatedWidth = measureText(truncatedText, fontSize).width;
    }
    
    return truncatedText + ellipsis;
  }

  override redraw() {
    const { textStyle, descriptionStyle } = this.option?.label || {};
    if (this.pieDescription) {
      const descriptionColor =
        descriptionStyle?.color || this.ctrl.getTheme().gauge.descriptionColor;
      this.pieDescription
        .attr('stroke', descriptionColor)
        .attr('fill', descriptionColor);
    }

    if (this.pieGuide) {
      const textColor =
        textStyle?.color || this.ctrl.getTheme().gauge.textColor;
      this.pieGuide.attr('stroke', textColor).attr('fill', textColor);
    }
  }
}

function calculatePaths(
  data: Array<{ color: string; value: number; values?: any }>,
  option: PieShapeOption,
  color: string,
  angleMin?: number,
) {
  const sum = data.reduce((acc, curr) => acc + curr.value, 0);
  const total = Math.max(option.total ?? sum, sum);
  const startAngle = (option.startAngle || 0) % (2 * Math.PI);
  const endAngle = (option.endAngle || 0) % (2 * Math.PI) || 2 * Math.PI;
  const diffAngle =
    endAngle < startAngle
      ? ((endAngle - startAngle) % (2 * Math.PI)) + 2 * Math.PI
      : endAngle - startAngle;
  const angles = data.map(
    data =>
      Math.max(
        (data.value / total) * diffAngle,
        data.value === 0 ? 0 : angleMin || 0,
      ),
    5,
  );
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
            innerRadius,
            outerRadius: innerRadius - 4,
            startAngle,
            endAngle,
          })!,
          config: {
            color,
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
