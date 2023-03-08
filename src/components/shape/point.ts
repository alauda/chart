import { get, isFunction, merge } from 'lodash';
import uPlot from 'uplot';

import { UPLOT_DEFAULT_OPTIONS } from '../../strategy/config.js';
import { UPlotViewStrategy } from '../../strategy/index.js';
import { pointWithin, Quadtree } from '../../strategy/quadtree.js';
import { Nilable } from '../../types/index.js';
import { convertRgba, ShapeType } from '../../utils/index.js';

import { Shape } from './index.js';

export type SizeCallback = (...args: unknown[]) => number;

const MAX_SIZE = 1000;

interface CustomSeries extends uPlot.Series {
  fill: () => string;
  stroke: () => string;
}

/**
 * Point 点图
 */
export default class Point extends Shape<Point> {
  override type = ShapeType.Point;

  private pointSize = 5;

  private sizeField = 'size';

  private readonly maxPointSize = MAX_SIZE;

  private sizeRange: [number, number] = [this.pointSize, this.maxPointSize];

  private sizeCallback: Nilable<SizeCallback>;

  private hRect: Quadtree;

  private get strategy() {
    return this.ctrl.strategyManage.getStrategy('uPlot') as UPlotViewStrategy;
  }

  private get qt() {
    return this.strategy.qt;
  }

  map(name: string) {
    this.mapName = name;
    return this;
  }

  /**
   * 设置 point 大小
   * @param field size 映射的数据字段 或者是大小
   * @param cfg [最大值,最小值] 或者 回调
   * @returns
   */
  size(
    field: number | string,
    options?: [number, number] | SizeCallback,
  ): Point {
    if (typeof field === 'number') {
      this.pointSize = field;
    }
    if (typeof field === 'string') {
      this.sizeField = field;
    }

    if (Array.isArray(options)) {
      this.sizeRange = options;
    }

    if (isFunction(options)) {
      this.sizeCallback = options;
    }

    return this;
  }

  getSeries() {
    const baseSeries = this.getBaseSeries();
    return this.getData().map(({ color, name }) => {
      return {
        stroke: color,
        label: name,
        paths: makeDrawPoints({
          disp: {
            size: {
              unit: 3, // raw CSS pixels
              values: (_, seriesIdx: number) => {
                const chartData = this.ctrl.getData();
                const data = chartData[seriesIdx - 1].values;
                return data.map(d => {
                  const field: number = get(d, this.sizeField) || this.pointSize;
                  const [min, max] = this.sizeRange;
                  let value = field;
                  if (field < min) {
                    value = min;
                  } else if (field > max) {
                    value = max;
                  }
                  return this.sizeCallback ? this.sizeCallback(value) : value;
                });
              },
            },
          },
          each: (
            u: uPlot,
            seriesIdx: number,
            dataIdx: number,
            lft: number,
            top: number,
            wid: number,
            hgt: number,
          ) => {
            // we get back raw canvas coords (included axes & padding). translate to the plotting area origin
            lft -= u.bbox.left;
            top -= u.bbox.top;
            this.qt.add({
              x: lft,
              y: top,
              w: wid,
              h: hgt,
              sidx: seriesIdx,
              didx: dataIdx,
            });
          },
        }),
        points: {
          show: false,
        },
        // ...getSeriesPathType(this.type, color),
        ...baseSeries,
        fill: convertRgba(color, 0.3),
      };
    });
  }

  override getOptions() {
    return {
      cursor: merge(UPLOT_DEFAULT_OPTIONS.cursor, this.getCursorOption()),
    };
  }

  private readonly getCursorOption = (): uPlot.Cursor => {
    return {
      x: false,
      dataIdx: (u: uPlot, seriesIdx: number) => {
        if (seriesIdx === 1) {
          this.hRect = null;

          let dist = Infinity;
          const cx = u.cursor.left * devicePixelRatio;
          const cy = u.cursor.top * devicePixelRatio;

          this.qt.getQ(cx, cy, 1, 1, o => {
            if (pointWithin(cx, cy, o.x, o.y, o.x + o.w, o.y + o.h)) {
              const ocx = o.x + o.w / 2;
              const ocy = o.y + o.h / 2;

              const dx = ocx - cx;
              const dy = ocy - cy;

              const d = Math.sqrt(dx ** 2 + dy ** 2);

              if (d <= o.w / 2 && d <= dist) {
                dist = d;
                this.hRect = o;
              }
            }
          });
        }
        return this.hRect && seriesIdx === this.hRect.sidx
          ? this.hRect.didx
          : null;
      },
      points: {
        fill: 'transparent',
        width: 1.5,
        size: (_u, seriesIdx) => {
          return this.hRect && seriesIdx === this.hRect.sidx
            ? this.hRect.w / devicePixelRatio
            : 0;
        },
      },
    };
  };
}

function makeDrawPoints(
  opts: uPlot.Series.BarsPathBuilderOpts,
  maxSize = MAX_SIZE,
) {
  const {
    disp,
    each = () => {
      // default empty fn
    },
  } = opts;

  return (u: uPlot, seriesIdx: number, idx0: number, idx1: number): any => {
    uPlot.orient(
      u,
      seriesIdx,
      (
        series: CustomSeries,
        _dataX,
        _dataY,
        scaleX,
        scaleY,
        valToPosX,
        valToPosY,
        xOff,
        yOff,
        xDim,
        yDim,
      ) => {
        const d = u.data;
        const strokeWidth = 1;
        u.ctx.save();

        u.ctx.rect(u.bbox.left, u.bbox.top, u.bbox.width, u.bbox.height);
        u.ctx.clip();
        u.ctx.fillStyle = series.fill();
        u.ctx.strokeStyle = series.stroke();
        u.ctx.lineWidth = strokeWidth;

        const deg360 = 2 * Math.PI;

        // compute bubble dims
        const sizes = disp.size.values(u, seriesIdx, idx0, idx1);

        // todo: this depends on direction & orientation
        // todo: calc once per redraw, not per path
        const filtLft = u.posToVal(-maxSize / 2, scaleX.key);
        const filtRgt = u.posToVal(
          u.bbox.width / devicePixelRatio + maxSize / 2,
          scaleX.key,
        );
        const filtBtm = u.posToVal(
          u.bbox.height / devicePixelRatio + maxSize / 2,
          scaleY.key,
        );
        const filtTop = u.posToVal(-maxSize / 2, scaleY.key);
        for (let i = 0; i < d[0].length; i++) {
          const xVal = d[0][i];
          const yVal = d[seriesIdx][i];
          const size = (sizes[i] as number) * devicePixelRatio;
          if (
            xVal >= filtLft &&
            xVal <= filtRgt &&
            yVal >= filtBtm &&
            yVal <= filtTop
          ) {
            const cx = valToPosX(xVal, scaleX, xDim, xOff);
            const cy = valToPosY(yVal, scaleY, yDim, yOff);

            u.ctx.moveTo(cx + size / 2, cy);
            u.ctx.beginPath();
            u.ctx.arc(cx, cy, size / 2, 0, deg360);
            u.ctx.fill();
            u.ctx.stroke();

            each(
              u,
              seriesIdx,
              i,
              cx - size / 2 - strokeWidth / 2,
              cy - size / 2 - strokeWidth / 2,
              size + strokeWidth,
              size + strokeWidth,
            );
          }
        }

        u.ctx.restore();
      },
    );

    return null;
  };
}
