import { select } from 'd3';
import * as d3 from 'd3';
import { get, isFunction, isNumber } from 'lodash-es';

import { ChartEvent } from '../../types/index.js';
import { Data, DataItem, PieShapeOption } from '../../types/options.js';
import {
  createSvg,
  generateName,
  getChartColor,
  PolarShapeType,
  template,
} from '../../utils/index.js';
import { Legend } from '../legend.js';

import { PolarShape } from './index.js';
import { Tooltip } from '../tooltip.js';

export const DEFAULT_RADIUS_DIFF = 8;
export const ACTIVE_RADIUS_ENLARGE_SIZE = 2;

const LAYOUT_CONFIG = {
  anchorOffset: 5, // P0 (起始点) 距离扇区外边缘的距离
  elbowRadiusScale: 1.2, // P1 (拐点) 圆环半径相对于外半径的倍数。越大越分散，线越长
  lineLength: 12, // P2 (终点) 水平引导线的长度
  labelHeight: 12, // 标签文字的估算高度 (用于碰撞计算，建议比字号稍大)
  paddingY: 2, // 标签之间的最小垂直间距
};

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
  polylinePoints?: Array<[number, number]>; // 兼容旧逻辑
}

interface TemporaryLabelData {
  data: PieItemValue;
  p0: [number, number]; // 起始点 (靠近饼图)
  idealP1: [number, number]; // 理想拐点 (未避让前)
  finalP1?: [number, number]; // 最终拐点 (避让后)
  isRightSide: boolean;
  color: string;
  labelText: string;
  originalIndex: number;
}

interface LabelLayoutData {
  startPoint: [number, number];
  elbowPoint: [number, number];
  endPoint: [number, number];
  textX: number;
  textY: number;
  textAlign: 'start' | 'end';
  labelText: string;
  color: string;
  data: Data; // 保留原始数据引用
  visible: boolean;
  index: number;
}

/**
 * 辅助函数：将极坐标 (D3 角度体系) 转换为笛卡尔坐标 (x, y)
 * D3 Arc: 0 在 12 点钟方向, 顺时针增加
 */
function polarToCartesian(radius: number, angle: number): [number, number] {
  return [radius * Math.sin(angle), -radius * Math.cos(angle)];
}
class LabelGroup {
  items: TemporaryLabelData[] = [];
  constructor(item: TemporaryLabelData) {
    this.items.push(item);
  }
  merge(other: LabelGroup) {
    this.items = this.items.concat(other.items);
    this.items.sort((a, b) => a.idealP1[1] - b.idealP1[1]);
  }
  overlaps(other: LabelGroup, spacing: number): boolean {
    const thisBottom = this.getBoundary(spacing).bottom;
    const otherTop = other.getBoundary(spacing).top;
    return thisBottom > otherTop;
  }
  getBoundary(spacing: number) {
    const totalHeight = this.items.length * spacing;
    const avgIdealY =
      this.items.reduce((sum, item) => sum + item.idealP1[1], 0) /
      this.items.length;
    const top = avgIdealY - totalHeight / 2;
    return { top, bottom: top + totalHeight };
  }
}

/**
 * Pie 饼图 / 环形图 组件
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

  /**
   * 生成标签文本
   */
  getLabelText(data: DataItem): string {
    const percent = +((data.value / this.totalValue || 0) * 100).toFixed(2);
    const { labels, formatter } = this.option.labelLine || {};

    let labelText = '';

    // 默认拼接逻辑
    if (labels && Array.isArray(labels)) {
      const parts: string[] = [];
      if (labels.includes('name')) parts.push(data.name);
      if (labels.includes('value'))
        parts.push(`${parts.length ? ': ' : ''}${data.value}`);
      if (labels.includes('percent')) parts.push(`  ${percent}%`);
      labelText = parts.join('');
    }

    // 自定义 formatter 覆盖
    if (formatter) {
      labelText = isFunction(formatter)
        ? formatter(data, percent)
        : template(formatter, { data, percent });
    }

    return labelText;
  }

  /**
   * 估算标签最大长度用于计算半径
   */
  calculateLabelLength(data: any) {
    if (!this.option?.labelLine?.labels) return 0;
    return this.getLabelText(data).length;
  }

  renderPie(clientHeight: number) {
    const { clientWidth } = this.svgEl.node()!;
    // 初始半径（基于宽高的最小值）
    let radius =
      Math.min(clientWidth, clientHeight) / 2 - ACTIVE_RADIUS_ENLARGE_SIZE;

    // 1. 水平方向约束 (防止左右标签溢出)
    let maxLabelCharLength = 0;
    this.data.forEach(d => {
      const len = this.calculateLabelLength(d);
      if (len > maxLabelCharLength) maxLabelCharLength = len;
    });

    const maxAllowedLabelWidth = clientWidth * 0.4; // 允许标签占单侧宽度的 40%
    const estimatedLabelWidth =
      maxLabelCharLength * 12 + LAYOUT_CONFIG.lineLength + 10;
    const finalLabelWidth = Math.min(estimatedLabelWidth, maxAllowedLabelWidth);

    const maxRadiusHorizontal = clientWidth / 2 - finalLabelWidth;

    // 2. 垂直方向约束 (关键优化：防止顶部/底部引导线溢出)
    // 逻辑：引导线最远会到达 r * scale 的位置。
    const verticalPadding = 20; // 顶部底部预留空间 (文字高度 + 少量留白)
    const maxRadiusVertical =
      (clientHeight / 2 - verticalPadding) / LAYOUT_CONFIG.elbowRadiusScale;

    // 3. 取所有限制中的最小值
    const maxRadius = Math.min(
      maxRadiusHorizontal,
      maxRadiusVertical,
      clientHeight / 2 - 10, // 最后的保底，防止贴边
    );

    // 4. 最小半径保护 (防止过度挤压导致饼图消失)
    const minRadius = Math.min(clientWidth, clientHeight) * 0.15;

    radius = Math.max(Math.min(radius, maxRadius), minRadius);

    // --- 优化结束 ---
    // 1. 获取原始路径数据
    const rawPaths = calculatePaths(
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

    const paths = rawPaths.map((p, i) => ({
      ...p,
      originalIndex: i,
    }));

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

  /**
   * 重心平衡布局 + 可见性过滤
   */
  calculateLabelLayout(paths: any[]): LabelLayoutData[] {
    const validPaths = paths
      .map((d, i) => ({ ...d, originalIndex: i }))
      .filter(d => d.data && d.data.value > 0);

    if (validPaths.length === 0) return [];

    const outerRadius = validPaths[0].config.outerRadius;
    const r0 = outerRadius + LAYOUT_CONFIG.anchorOffset;
    const r1 = outerRadius * LAYOUT_CONFIG.elbowRadiusScale;
    const spacing = LAYOUT_CONFIG.labelHeight + LAYOUT_CONFIG.paddingY;
    const maxY = r1 * 1.5; // 画布垂直边界限制

    // 1. 初始化
    let allLabels: TemporaryLabelData[] = validPaths.map((d: any) => {
      const midAngle = (d.config.startAngle + d.config.endAngle) / 2;
      const normalizedAngle = midAngle % (Math.PI * 2);
      const isRightSide = normalizedAngle >= 0 && normalizedAngle < Math.PI;

      return {
        data: d,
        p0: polarToCartesian(r0, midAngle),
        idealP1: polarToCartesian(r1, midAngle),
        finalP1: [0, 0],
        isRightSide: isRightSide,
        color: d.config.color,
        labelText: this.getLabelText(d.data),
        originalIndex: d.originalIndex,
      };
    });

    const leftLabels = allLabels
      .filter(d => !d.isRightSide)
      .sort((a, b) => a.idealP1[1] - b.idealP1[1]);
    const rightLabels = allLabels
      .filter(d => d.isRightSide)
      .sort((a, b) => a.idealP1[1] - b.idealP1[1]);

    // 2. 布局计算与可见性过滤函数
    const processSide = (labels: TemporaryLabelData[], isRight: boolean) => {
      if (labels.length === 0) return [];

      let groups: LabelGroup[] = labels.map(l => new LabelGroup(l));
      let hasOverlap = true;
      while (hasOverlap) {
        hasOverlap = false;
        for (let i = 0; i < groups.length - 1; i++) {
          if (groups[i].overlaps(groups[i + 1], spacing)) {
            groups[i].merge(groups[i + 1]);
            groups.splice(i + 1, 1);
            hasOverlap = true;
            break;
          }
        }
      }

      let results: LabelLayoutData[] = [];
      let lastVisibleY = -Infinity; 

      groups.forEach(group => {
        const boundary = group.getBoundary(spacing);
        let currentY = boundary.top + spacing / 2;

        group.items.forEach(item => {
         
          const stackedY = Math.max(-maxY, Math.min(maxY, currentY));

          let visible = true;
          if (Math.abs(stackedY) > r1 * 1.2) visible = false;
          if (
            visible &&
            stackedY - LAYOUT_CONFIG.labelHeight / 2 <
              lastVisibleY + LAYOUT_CONFIG.paddingY
          ) {
            visible = false;
          }

          let finalY: number;

          if (visible) {
            finalY = stackedY;
            lastVisibleY = finalY + LAYOUT_CONFIG.labelHeight / 2;
          } else {
            finalY = Math.max(-maxY, Math.min(maxY, item.idealP1[1]));
          }

          let xAbs = 0;
          if (Math.abs(finalY) < r1) {
            xAbs = Math.sqrt(r1 * r1 - finalY * finalY);
          } else {
            xAbs = 10;
          }

          const p1: [number, number] = [isRight ? xAbs : -xAbs, finalY];
          const p2: [number, number] = [
            p1[0] +
              (isRight ? LAYOUT_CONFIG.lineLength : -LAYOUT_CONFIG.lineLength),
            p1[1],
          ];

          results.push({
            startPoint: item.p0,
            elbowPoint: p1,
            endPoint: p2,
            textX: p2[0] + (isRight ? 5 : -5),
            textY: p2[1],
            textAlign: isRight ? 'start' : 'end',
            labelText: item.labelText,
            color: item.color,
            data: item.data.data,
            index: item.originalIndex,
            visible: visible,
          });

          currentY += spacing;

        });
      });
      return results;
    };

    const leftResults = processSide(leftLabels, false);
    const rightResults = processSide(rightLabels, true);

    return [...leftResults, ...rightResults];
  }

  /**
   * 渲染引导线：增加 class 和 初始 opacity
   */
  renderGuidelines(paths: any) {
    this.container.selectAll('.guideline-group').remove();

    if (!this.option?.labelLine?.show || this.nullData) return;

    const { clientWidth } = this.svgEl.node()!;

    const layoutData = this.calculateLabelLayout(paths);

    const guidelineGroup = this.container
      .selectAll('.guideline-group')
      .data([null])
      .join('g')
      .attr('class', 'guideline-group');

    // 绘制折线 (保持不变)
    guidelineGroup
      .selectAll('.guideline')
      .data(layoutData)
      .join('path')
      .attr('class', d => `guideline label-item-${d.index}`)
      .attr('fill', 'none')
      .attr('stroke', d => d.color)
      .attr(
        'd',
        d =>
          `M${d.startPoint[0]},${d.startPoint[1]}L${d.elbowPoint[0]},${d.elbowPoint[1]}L${d.endPoint[0]},${d.endPoint[1]}`,
      )
      .attr('opacity', d => (d.visible ? 1 : 0))
      .style('pointer-events', 'none');

    guidelineGroup
      .selectAll('.label')
      .data(layoutData)
      .join('text')
      .attr('class', d => `label label-item-${d.index}`)
      .attr('x', d => d.textX)
      .attr('y', d => d.textY)
      .attr('dy', '0.35em')
      .attr('text-anchor', d => d.textAlign)
      .style('paint-order', 'stroke fill') // 关键：描边在底部，填充在顶部
      .style('stroke', '#fff') // 必须与背景色一致
      .style('stroke-width', '5px') // 加粗！3px可能盖不住，5px效果更好
      .style('stroke-linecap', 'butt')
      .style('stroke-linejoin', 'miter')
      .text(d => {
        const absX = Math.abs(d.textX);
        const halfWidth = clientWidth / 2; 
        const maxTextWidth = halfWidth - absX - 10;
        return truncateText(d.labelText, Math.max(0, maxTextWidth));
      })
      .attr('opacity', d => (d.visible ? 1 : 0))
      .style('font-size', '12px')
      .style('pointer-events', 'none'); // 避免文字遮挡鼠标事件
  }

  /**
   * 交互事件监听：增加 Hover 联动
   */
  addListener() {
    const pieItems = this.container.selectAll('path').filter(function (d: any) {
      return !!d.data;
    });

    const ctrl = this.ctrl;
    const container = this.container; 

    pieItems
      .on('mouseover', function (event: MouseEvent, data: any) {
        ctrl.emit(ChartEvent.ELEMENT_MOUSEMOVE, { self: this, event, data });
        if (!ctrl.hideTooltip) {
          ctrl.emit(ChartEvent.U_PLOT_SET_CURSOR, {
            anchor: event.target,
            values: [data.data],
          });
          (ctrl.components.get('tooltip') as Tooltip).showTooltip();
        }

        d3.select(this as any).attr('opacity', 0.9);
        const currentIndex = (data as any).originalIndex;
        const currentGroup = container.selectAll(`.label-item-${currentIndex}`);

        currentGroup
          .attr('opacity', 1) 
          .style('font-weight', 'bold')
          .raise();
      })
      .on('mouseover.highlight', (_, d: any) => {
        container
          .selectAll('.guideline, .label')
          .attr('opacity', (labelData: any) => {
            if (labelData.data === d.data) return 1;
            return labelData.visible ? 1 : 0;
          })
          .style('font-weight', (labelData: any) => {
            return labelData.data === d.data ? 'bold' : 'normal';
          });

        container
          .selectAll(`.label-item-${(d as any).originalIndex || ''}`)
          .raise();
      })
      .on('mouseout', function (event, data) {
        d3.select(this as any).attr('opacity', 1);

        container
          .selectAll('.guideline, .label')
          .attr('opacity', (labelData: any) => (labelData.visible ? 1 : 0))
          .style('font-weight', 'normal');

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
        .style('top', `calc(50% + ${x}px)`)
        .style('left', `calc(50% + ${y}px)`)
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
            color: data[ind].color || getChartColor(data[ind].name)!,
            startAngle,
            endAngle,
            ...baseConfig,
          },
          data: data[ind],
          polylinePoints,
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

/**
 * 文本截断辅助函数
 * @param text 原始文本
 * @param maxWidth 最大允许像素宽度
 * @param fontSize 字体大小 (默认12px)
 */
function truncateText(text: string, maxWidth: number, fontSize: number = 12) {
  const charWidth = fontSize;
  let currentWidth = 0;
  let result = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    // 粗略判断字符宽度
    currentWidth += char.charCodeAt(0) > 255 ? charWidth : charWidth * 0.6;

    if (currentWidth > maxWidth - charWidth * 1.5) {
      // 预留 ... 的空间
      return result + '...';
    }
    result += char;
  }
  return text;
}
