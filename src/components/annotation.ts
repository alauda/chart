import { StyleSheet, css } from 'aphrodite/no-important.js';
import { get, merge, set } from 'lodash';
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
    const y = get(this.option, 'lineY');
    this.lineX(x);
    this.lineY(y);
  }

  update() {
    // ..
    this.option = get(this.ctrl.getOption(), this.name);
    const x = get(this.option, 'lineX');
    const y = get(this.option, 'lineY');
    this.lineX(x);
    this.lineY(y);
  }

  lineX(options: AnnotationLineOption) {
    if (this.annotationXFn.length) {
      this.updateLine('lineX', options);
      return this;
    } else {
      this.ctrl.setOption([this.name, 'lineX'], options);
    }
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
      let ctx = u.ctx;
      ctx.save();
      const xData = u.data[0];

      const isTransposed = u.scales.y.ori === 0 && u.axes[1].side === 2;

      const posValue =
        u.scales.x.distr === 2
          ? xData.findIndex(d => d === data)
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
      ctx.setLineDash(style?.lineDash);
      ctx.lineWidth = style?.width;
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.strokeStyle = style?.stroke;
      ctx.stroke();

      if (x0 && text?.content) {
        const markE = u.over.querySelector('.u-mark-x') as HTMLElement;
        const markLabelE = u.over.querySelector(
          '.u-mark-x-label',
        ) as HTMLElement;
        let markEl = markE || document.createElement('div');
        markEl.className = `u-mark-x ${css(styles['mark-x'])}`;

        let labelEl = markLabelE || document.createElement('div');
        labelEl.className = `u-mark-x-label ${css(styles['mark-x-label'])}`;
        if (text?.border) {
          const { padding, style } = text?.border;
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

        !markLabelE && markEl.appendChild(labelEl);
        !markE && u.over.appendChild(markEl);
      }

      ctx.restore();
    };
    this.annotationXFn.push(fn);
    return this;
  }

  private updateLine(type: 'lineX' | 'lineY', options?: AnnotationLineOption) {
    const opt = merge(get(this.option, type), options);
    set(this.option, type, opt);
    this.ctrl.setOption([this.name, type], opt);
    this.ctrl.redraw();
  }

  lineY(options: AnnotationLineOption) {
    if (this.annotationYFn.length) {
      this.updateLine('lineY', options);
      return this;
    } else {
      this.ctrl.setOption([this.name, 'lineY'], options);
    }

    const fn = (u: uPlot) => {
      const {
        data,
        text,
        style = { lineDash: [8, 5], width: 2, stroke: 'red' },
      } = get(this.option, 'lineY', {}) as AnnotationLineOption;
      if (!data) {
        return;
      }
      let ctx = u.ctx;
      ctx.save();
      let [i0, i1] = u.series[0].idxs;
      let d = u.data[0];
      let x0 = u.valToPos(d[i0], 'x', true);
      let x1 = u.valToPos(d[i1], 'x', true);
      let y1 = u.valToPos(data as number, 'y', true);

      ctx.beginPath();
      ctx.setLineDash(style?.lineDash);
      ctx.lineWidth = style?.width;
      ctx.moveTo(x1, y1);
      ctx.lineTo(x0, y1);
      ctx.strokeStyle = 'red' || style?.stroke;
      ctx.stroke();

      if (text?.content) {
        const { width, actualBoundingBoxDescent } = ctx.measureText(
          String(text.content),
        );
        ctx.fillStyle = 'red';
        ctx.fillText(
          String(text.content),
          this.getTextPosition(text.position, x0, width, u.bbox.width),
          y1 - (actualBoundingBoxDescent + TEXT_SPACE),
        );
      }

      ctx.restore();
    };
    this.annotationYFn.push(fn);
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
