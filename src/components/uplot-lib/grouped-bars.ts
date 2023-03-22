import uPlot, { Axis } from 'uplot';

import { pointWithin, Quadtree } from '../../strategy/quadtree.js';

interface SeriesBarsPluginProps {
  time: boolean;
  radius?: number;
  marginRatio?: number;
  ori: number;
  dir: number;
  stacked?: boolean;
  ignore?: number[];
  disp?: any;
}

const SPACE_BETWEEN = 1;
const SPACE_AROUND = 2;
const SPACE_EVENLY = 3;

function roundDec(val: number, dec: number) {
  return Math.round(val * (dec = 10 ** dec)) / dec;
}

const coord = (i: number, offs: number, iwid: number, gap: number) =>
  roundDec(offs + i * (iwid + gap), 6);

// eslint-disable-next-line sonarjs/cognitive-complexity
export function distr(
  numItems: number,
  sizeFactor: number,
  justify: number,
  onlyIdx: number,
  each: (index: number, coord: number, id: number) => void,
) {
  const space = 1 - sizeFactor;

  let gap =
    justify === SPACE_BETWEEN
      ? space / (numItems - 1)
      : justify === SPACE_AROUND
      ? space / numItems
      : justify === SPACE_EVENLY
      ? space / (numItems + 1)
      : 0;

  if (isNaN(gap) || gap === Infinity) gap = 0;

  const offs =
    justify === SPACE_BETWEEN
      ? 0
      : justify === SPACE_AROUND
      ? gap / 2
      : justify === SPACE_EVENLY
      ? gap
      : 0;

  const iwid = sizeFactor / numItems;
  const _iwid = roundDec(iwid, 6);

  if (onlyIdx == null) {
    for (let i = 0; i < numItems; i++)
      each(i, coord(i, offs, iwid, gap), _iwid);
  } else each(onlyIdx, coord(onlyIdx, offs, iwid, gap), _iwid);
}

export function seriesBarsPlugin(opts: SeriesBarsPluginProps) {
  let pxRatio: number;
  // let font: string;

  const {
    time,
    ignore = [],
    radius: _radius,
    ori: _ori,
    dir: _dir,
    stacked: _stacked,
    marginRatio,
    disp,
  } = opts;

  const radius = _radius ?? 0;

  // function setPxRatio() {
  //   pxRatio = devicePixelRatio;
  //   font = Math.round(10 * pxRatio) + 'px Arial';
  // }

  // setPxRatio();

  // window.addEventListener('dppxchange', setPxRatio);

  const ori = _ori;
  const dir = _dir;
  const stacked = _stacked;

  const groupWidth = 0.9;
  const groupDistr = SPACE_BETWEEN;

  const barWidth = 1 - (marginRatio || 0);
  const barDistr = SPACE_BETWEEN;

  function distrTwo(
    groupCount: number,
    barCount: number,
    _groupWidth = groupWidth,
  ) {
    const out = Array.from({ length: barCount }, () => ({
      offs: Array.from({ length: groupCount }).fill(0),
      size: Array.from({ length: groupCount }).fill(0),
    }));

    distr(
      groupCount,
      _groupWidth,
      groupDistr,
      null,
      (groupIdx, groupOffPct, groupDimPct) => {
        distr(
          barCount,
          barWidth,
          barDistr,
          null,
          (barIdx, barOffPct, barDimPct) => {
            out[barIdx].offs[groupIdx] = groupOffPct + groupDimPct * barOffPct;
            out[barIdx].size[groupIdx] = groupDimPct * barDimPct;
          },
        );
      },
    );

    return out;
  }

  function distrOne(groupCount: number, barCount: number) {
    const out = Array.from({ length: barCount }, () => ({
      offs: Array.from({ length: groupCount }).fill(0),
      size: Array.from({ length: groupCount }).fill(0),
    }));

    distr(
      groupCount,
      groupWidth,
      groupDistr,
      null,
      (groupIdx, groupOffPct, groupDimPct) => {
        distr(
          barCount,
          barWidth,
          barDistr,
          null,
          (barIdx, _barOffPct, _barDimPct) => {
            out[barIdx].offs[groupIdx] = groupOffPct;
            out[barIdx].size[groupIdx] = groupDimPct;
          },
        );
      },
    );

    return out;
  }

  let barsPctLayout: any;
  // eslint-disable-next-line sonarjs/no-unused-collection
  let barsColors: Array<{ fill: string; stroke: string }>;
  let qt: Quadtree;

  const barsBuilder = uPlot.paths.bars({
    radius,
    disp: {
      x0: {
        unit: 2,
        //	discr: false, (unary, discrete, continuous)
        values: (_u, seriesIdx, _idx0, _idx1) => barsPctLayout[seriesIdx].offs,
      },
      size: {
        unit: 2,
        // discr: true,
        values: (_u, seriesIdx, _idx0, _idx1) => barsPctLayout[seriesIdx].size,
      },
      ...disp,
      /*
			// e.g. variable size via scale (will compute offsets from known values)
			x1: {
				units: 1,
				values: (u, seriesIdx, idx0, idx1) => bucketEnds[idx],
			},
		*/
    },
    each: (u, seriesIdx, dataIdx, lft, top, wid, hgt) => {
      // we get back raw canvas coords (included axes & padding). translate to the plotting area origin
      lft -= u.bbox.left;
      top -= u.bbox.top;
      qt.add({
        x: lft,
        y: top,
        w: wid,
        h: hgt,
        sidx: seriesIdx,
        didx: dataIdx,
      });
    },
  });

  // function drawPoints(u: uPlot, sidx: number, i0: number, i1: number) {
  //   u.ctx.save();

  //   u.ctx.font = font;
  //   u.ctx.fillStyle = 'black';

  //   uPlot.orient(
  //     u,
  //     sidx,
  //     (
  //       _series,
  //       _dataX,
  //       dataY,
  //       _scaleX,
  //       scaleY,
  //       _valToPosX,
  //       valToPosY,
  //       xOff,
  //       yOff,
  //       xDim,
  //       yDim,
  //       _moveTo,
  //       _lineTo,
  //       _rect,
  //     ) => {
  //       const _dir = dir * (ori == 0 ? 1 : -1);

  //       const wid = Math.round(barsPctLayout[sidx].size[0] * xDim);

  //       barsPctLayout[sidx].offs.forEach((offs: number, ix: number) => {
  //         if (dataY[ix] != null) {
  //           let x0 = xDim * offs;
  //           let lft = Math.round(xOff + (_dir == 1 ? x0 : xDim - x0 - wid));
  //           let barWid = Math.round(wid);

  //           let yPos = valToPosY(dataY[ix], scaleY, yDim, yOff);

  //           let x = ori == 0 ? Math.round(lft + barWid / 2) : Math.round(yPos);
  //           let y = ori == 0 ? Math.round(yPos) : Math.round(lft + barWid / 2);

  //           u.ctx.textAlign =
  //             ori == 0 ? 'center' : dataY[ix] >= 0 ? 'left' : 'right';
  //           u.ctx.textBaseline =
  //             ori == 1 ? 'middle' : dataY[ix] >= 0 ? 'bottom' : 'top';

  //           u.ctx.fillText(String(dataY[ix]), x, y);
  //         }
  //       });
  //     },
  //   );

  //   u.ctx.restore();
  // }

  function range(_u: uPlot, _dataMin: number, dataMax: number) {
    const [min, max] = uPlot.rangeNum(0, dataMax, 0.05, true);
    return [min || 0, max];
  }

  return {
    hooks: {
      drawClear: (u: uPlot) => {
        qt = qt || new Quadtree(0, 0, u.bbox.width, u.bbox.height);

        qt.clear();

        // force-clear the path cache to cause drawBars() to rebuild new quadtree
        u.series.forEach((s: any) => {
          s._paths = null;
        });

        if (stacked)
          barsPctLayout = [null].concat(
            distrOne(u.data.length - 1 - ignore.length, u.data[0].length),
          );
        else if (u.series.length === 2)
          barsPctLayout = [null].concat(distrOne(u.data[0].length, 1));
        else
          barsPctLayout = [null].concat(
            distrTwo(
              u.data[0].length,
              u.data.length - 1 - ignore.length,
              u.data[0].length === 1 ? 1 : groupWidth,
            ),
          );

        // TODOL only do on setData, not every redraw
        const { disp } = opts;
        if (disp?.fill != null) {
          barsColors = [null];

          for (let i = 1; i < u.data.length; i++) {
            barsColors.push({
              fill: disp.fill.values(u, i),
              stroke: disp.stroke.values(u, i),
            });
          }
        }
      },
    },
    // eslint-disable-next-line sonarjs/cognitive-complexity
    opts: (_u: uPlot, opts: any) => {
      const { axes, series } = opts;
      const yScaleOpts = {
        range,
        ori: ori === 0 ? 1 : 0,
      };
      // hovered
      let hRect: Quadtree;

      uPlot.assign(opts, {
        select: { show: false },
        cursor: {
          x: false,
          y: false,
          dataIdx: (u: uPlot, seriesIdx: number) => {
            if (seriesIdx === 1) {
              hRect = null;

              const cx = u.cursor.left * pxRatio;
              const cy = u.cursor.top * pxRatio;

              qt.getQ(cx, cy, 1, 1, o => {
                if (pointWithin(cx, cy, o.x, o.y, o.x + o.w, o.y + o.h))
                  hRect = o;
              });
            }

            return hRect && seriesIdx === hRect.sidx ? hRect.didx : null;
          },
          points: {
            show: false,
            // fill: 'rgba(255,255,255, 0.3)',
            // bbox: (u: uPlot, seriesIdx: number) => {
            //   let isHovered = hRect && seriesIdx == hRect.sidx;

            //   return {
            //     left: isHovered ? hRect.x / pxRatio : -10,
            //     top: isHovered ? hRect.y / pxRatio : -10,
            //     width: isHovered ? hRect.w / pxRatio : 0,
            //     height: isHovered ? hRect.h / pxRatio : 0,
            //   };
            // },
          },
        },
        scales: {
          x: {
            distr: 2,
            ori,
            dir,
            // auto: true,
            range: (u: uPlot) => {
              let min = 0;
              let max = Math.max(1, u.data[0].length - 1);

              let pctOffset = 0;

              distr(
                u.data[0].length,
                groupWidth,
                groupDistr,
                0,
                (_di, lftPct, widPct) => {
                  pctOffset = lftPct + widPct / 2;
                },
              );

              const rn = max - min;

              if (pctOffset === 0.5) min -= rn;
              else {
                const upScale = 1 / (1 - pctOffset * 2);
                const offset = (upScale * rn - rn) / 2;

                min -= offset;
                max += offset;
              }

              return [min, max];
            },
          },
          rend: yScaleOpts,
          size: yScaleOpts,
          mem: yScaleOpts,
          inter: yScaleOpts,
          toggle: yScaleOpts,
        },
      });

      if (ori === 1) {
        opts.padding = [0, null, 0, null];
      }
      const { xSplits } = getBarConfig({
        dir,
        ori,
        xSpacing: dir === 1 ? 100 : -100,
      });
      const values = time === false ? { values: (u: uPlot) => u.data[0] } : {};
      uPlot.assign(axes[0], {
        // splits: (u: any, _axisIdx: number) => {
        //   const _dir = dir * (ori === 0 ? 1 : -1);
        //   // TODO？？？？
        //   const splits = u._data[0].slice();
        //   return _dir === 1 ? splits : splits.reverse();
        // },
        splits: xSplits,
        // 设置 x 坐标展示
        ...values,
        gap: 15,
        size: ori === 0 ? 40 : 150,
        labelSize: 20,
        grid: { show: false },
        ticks: { show: false },

        side: ori === 0 ? 2 : 3,
      });

      series.forEach((s: object, i: number) => {
        if (i > 0 && !ignore.includes(i)) {
          uPlot.assign(s, {
            //	pxAlign: false,
            //	stroke: "rgba(255,0,0,0.5)",
            paths: barsBuilder,
            points: {
              // show: drawPoints,
              show: false,
            },
          });
        }
      });
    },
  };
}

/**
 * @internal
 */
export function getBarConfig(opts: {
  ori: number;
  dir: number;
  xSpacing: number;
}) {
  const { ori = 0, dir = 1, xSpacing = 0 } = opts;
  const isXHorizontal = ori === 0;
  const xSplits: Axis.Splits = (u: uPlot) => {
    const dim = isXHorizontal ? u.bbox.width : u.bbox.height;
    const _dir = dir * (isXHorizontal ? 1 : -1);

    let dataLen = u.data[0].length;
    let lastIdx = dataLen - 1;

    let skipMod = 0;

    if (xSpacing !== 0) {
      let cssDim = dim / devicePixelRatio;
      // let maxTicks = Math.abs(Math.floor(cssDim / xSpacing));
      let maxTicks = Math.abs(
        Math.floor(cssDim / (isXHorizontal ? xSpacing : xSpacing / 3)),
      );

      skipMod = dataLen < maxTicks ? 0 : Math.ceil(dataLen / maxTicks);
    }

    let splits: number[] = [];

    // for distr: 2 scales, the splits array should contain indices into data[0] rather than values
    u.data[0].forEach((_v, i) => {
      let shouldSkip =
        skipMod !== 0 && (xSpacing > 0 ? i : lastIdx - i) % skipMod > 0;

      if (!shouldSkip) {
        splits.push(i);
      }
    });

    return _dir === 1 ? splits : splits.reverse();
  };

  return { xSplits };
}

export function stack(
  data: uPlot.AlignedData,
  omit: (i: number) => boolean = () => false,
): { data: uPlot.AlignedData; bands: uPlot.Band[] } {
  const data2 = [];
  let bands: uPlot.Band[] = [];
  const d0Len = data[0].length;
  const accuse: any[] = Array.from({ length: d0Len });

  for (let i = 0; i < d0Len; i++) accuse[i] = 0;

  for (let i = 1; i < data.length; i++)
    data2.push(omit(i) ? data[i] : data[i].map((v, i) => (accuse[i] += +v)));

  for (let i = 1; i < data.length; i++)
    !omit(i) &&
      bands.push({
        series: [data.findIndex((_s, j) => j > i && !omit(j)), i],
      });

  bands = bands.filter(b => b.series[1] > -1);

  return {
    data: [data[0]].concat(data2) as uPlot.AlignedData,
    bands,
  };
}
