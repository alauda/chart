import { StyleSheet, css } from 'aphrodite/no-important.js';
import { get, merge, set, uniqBy } from 'lodash';

import { AnnotationLineOption, AnnotationOption } from '../types/index.js';

import { BaseComponent } from './base.js';

const TEXT_SPACE = 4;

const styles = StyleSheet.create({
  'mark-x': {
    position: 'absolute',
    display: 'inline-block',
    height: '100%',
  },
  'mark-x-label': {
    position: 'absolute',
    transform: 'translateX(-50%)',
    padding: '0 8px',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    // background: '#fff',
  },
});

export class Annotation extends BaseComponent<AnnotationOption> {
  get name(): string {
    return 'annotation';
  }

  annotationXFn: Array<(u: uPlot) => void> = [];
  annotationYFn: Array<(u: uPlot) => void> = [];

  render() {
    // ..
    const opt = this.ctrl.getOption();
    this.option = get(opt, this.name, {});
    const x = get(this.option, 'lineX');
    const yList = get(this.option, 'lineY', []);
    this.lineX(x);
    yList?.forEach(y => this.lineY(y));
  }

  update() {
    // ..
    this.option = get(this.ctrl.getOption(), this.name);
    const x = get(this.option, 'lineX');
    const yList = get(this.option, 'lineY', []);
    this.lineX(x);
    yList?.forEach(y => this.lineY(y));
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  lineX(options: AnnotationLineOption) {
    if (this.annotationXFn.length) {
      const opt = merge(get(this.option, 'lineX'), options);
      set(this.option, 'lineX', opt);
      this.ctrl.setOption([this.name, 'lineX'], opt);
      this.ctrl.redraw();
      return this;
    }
    this.ctrl.setOption([this.name, 'lineX'], options);
    const fn = (u: uPlot) => {
      const {
        data,
        text,
        style = {
          lineDash: [5, 5],
          width: 2,
          stroke: this.ctrl.getTheme().colorVar['n-6'],
        },
      } = get(this.option, 'lineX', {}) as AnnotationLineOption;
      if (!data) {
        return;
      }
      const ctx = u.ctx;
      ctx.save();
      const xData = u.data[0];

      const isTransposed = u.scales.y.ori === 0 && u.axes[1].side === 2;

      const posValue =
        u.scales.x.distr === 2
          ? xData.indexOf(data as number)
          : (data as number);
      const x0 = isTransposed
        ? u.valToPos(u.scales.y.min, 'y', true)
        : u.valToPos(posValue, 'x', true);
      const x1 = isTransposed ? u.bbox.width : x0;
      const y0 = isTransposed ? u.valToPos(posValue, 'x', true) : u.bbox.top;
      const y1 = isTransposed
        ? u.valToPos(posValue, 'x', true)
        : u.valToPos(u.scales.y.min, 'y', true);
      ctx.beginPath();
      ctx.setLineDash(style?.lineDash || [5, 5]);
      ctx.lineWidth = style?.width || 2;
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.strokeStyle = style?.stroke || 'red';
      ctx.stroke();

      if (x0 && text?.content) {
        const markE = u.over.querySelector('.u-mark-x');
        const markLabelE = u.over.querySelector('.u-mark-x-label');
        const markEl = (markE || document.createElement('div')) as HTMLElement;
        markEl.className = `u-mark-x ${css(styles['mark-x'])}`;

        const labelEl = (markLabelE ||
          document.createElement('div')) as HTMLElement;
        labelEl.className = `u-mark-x-label ${css(styles['mark-x-label'])}`;
        if (text?.border) {
          const { padding, style } = text?.border || {};
          labelEl.style.padding = padding
            ? `${padding[0]}px ${padding[1]}px`
            : '0 8px';
          labelEl.style.border = style;
        }
        labelEl.textContent = String(text.content);
        Object.assign(labelEl.style, text.style || {});
        const labelStyle = getComputedStyle(labelEl);

        requestAnimationFrame(() => {
          const x = isTransposed
            ? u.valToPos(u.scales.y.max, 'y')
            : Math.round(u.valToPos(posValue, 'x'));
          const markElWidth = parseInt(labelStyle.width, 10) / 2;

          const y = isTransposed
            ? u.valToPos(posValue, 'x') - parseInt(labelStyle.height, 10) / 2
            : -parseInt(labelStyle.height, 10) + TEXT_SPACE;
          let left = x;
          if (x + markElWidth > u.over.clientWidth) {
            left = x - markElWidth;
          }
          if (x <= 0) {
            left = x + markElWidth;
          }
          markEl.style.left = `${left}px`;
          markEl.style.top = `${y}px`;
        });

        !markLabelE && markEl.append(labelEl);
        !markE && u.over.append(markEl);
      }

      ctx.restore();
    };
    this.annotationXFn.push(fn);
    return this;
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  lineY(options: AnnotationLineOption) {
    this.setOptions('lineY', options);
    if (this.annotationYFn.length) {
      this.ctrl.redraw();
      return this;
    }
    const fn = (u: uPlot) => {
      const values = get(this.option, 'lineY', []) as AnnotationLineOption[];
      if (!values.length) {
        return;
      }
      const ctx = u.ctx;
      values.forEach(item => {
        const {
          data,
          text,
          style = { lineDash: [8, 5], width: 2, stroke: 'red' },
        } = item;
        ctx.save();
        const isTransposed = u.scales.y.ori === 0 && u.axes[1].side === 2;
        const [i0, i1] = u.series[0].idxs;
        const d = u.data[0];
        const x0 = isTransposed
          ? u.valToPos(data as number, 'y', true)
          : u.bbox.left || u.valToPos(d[i0], 'x', true); // x 开始位置
        const x1 = isTransposed
          ? u.valToPos(data as number, 'y', true)
          : u.bbox.width + u.bbox.left || u.valToPos(d[i1], 'x', true); // x 结束为止
        const y1 = isTransposed
          ? u.bbox.height
          : u.valToPos(data as number, 'y', true); // y 位置
        ctx.beginPath();
        ctx.setLineDash(style?.lineDash || [8, 5]);
        ctx.lineWidth = style?.width || 2;

        ctx.moveTo(x1, isTransposed ? 0 : y1);
        ctx.lineTo(x0, y1);
        // ctx.moveTo(x1, y1);
        // ctx.lineTo(x0, y1);
        ctx.strokeStyle = style?.stroke || 'red';
        ctx.stroke();
        if (text?.content) {
          const { width, actualBoundingBoxDescent } = ctx.measureText(
            String(text.content),
          );
          ctx.fillStyle = style?.stroke || 'red';
          ctx.fillText(
            String(text.content),
            this.getTextPosition(text.position, x0, width, u.bbox.width),
            isTransposed ? 0 : y1 - (actualBoundingBoxDescent + TEXT_SPACE),
          );
        }
      });
      ctx.restore();
    };
    this.annotationYFn.push(fn);
  }

  setOptions(type: 'lineY' | 'lineX', options: AnnotationLineOption) {
    const option = get(this.ctrl.getOption(), [this.name, type]) || [];
    const data = uniqBy([...option, options], 'data');
    this.ctrl.setOption([this.name, type], data);
  }

  getTextPosition(
    position: 'left' | 'right' | string = 'left',
    start: number,
    textWidth: number,
    width: number,
  ) {
    let x = start;
    if (position === 'left') {
      x = start + textWidth + TEXT_SPACE;
    }

    if (position === 'right') {
      x = start + width;
    }
    return x;
  }

  getOptions() {
    return {
      hooks: {
        draw: [
          (u: uPlot) => {
            [...this.annotationXFn, ...this.annotationYFn].forEach(fn => fn(u));
          },
        ],
      },
    };
  }
}
