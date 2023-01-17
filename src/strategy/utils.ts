import UPlot from 'uplot';

import { StepType } from '../components/shape/line.js';
import { convertRgba } from '../index.js';
import { ShapeType } from '../utils/component.js';

// eslint-disable-next-line sonarjs/cognitive-complexity
export function scaleGradient(
  u: UPlot,
  scaleKey: string,
  ori: number,
  scaleStops: Array<[number, string]>,
  discrete = false,
) {
  const can = document.createElement('canvas');
  const ctx = can.getContext('2d');
  const scale = u.scales[scaleKey];

  // we want the stop below or at the scaleMax
  // and the stop below or at the scaleMin, else the stop above scaleMin
  let minStopIdx: number;
  let maxStopIdx: number;

  for (const [i, scaleStop] of scaleStops.entries()) {
    const stopVal = scaleStop[0];

    if (stopVal <= scale.min || minStopIdx == null) minStopIdx = i;

    maxStopIdx = i;

    if (stopVal >= scale.max) break;
  }

  if (minStopIdx === maxStopIdx) return scaleStops[minStopIdx][1];
  let minStopVal = scaleStops[minStopIdx][0];
  let maxStopVal = scaleStops[maxStopIdx][0];

  if (minStopVal === -Infinity) minStopVal = scale.min;

  if (maxStopVal === Infinity) maxStopVal = scale.max;

  const minStopPos = u.valToPos(minStopVal, scaleKey, true);
  const maxStopPos = u.valToPos(maxStopVal, scaleKey, true);

  const range = minStopPos - maxStopPos;

  let x0: number, y0: number, x1: number, y1: number;

  if (ori === 1) {
    x0 = x1 = 0;
    y0 = minStopPos;
    y1 = maxStopPos;
  } else {
    y0 = y1 = 0;
    x0 = minStopPos;
    x1 = maxStopPos;
  }

  const grd = ctx.createLinearGradient(x0, y0, x1, y1);
  let prevColor: string;

  for (let i = minStopIdx; i <= maxStopIdx; i++) {
    const s = scaleStops[i];

    const stopPos =
      i === minStopIdx
        ? minStopPos
        : i === maxStopIdx
        ? maxStopPos
        : u.valToPos(s[0], scaleKey, true);
    const pct = (minStopPos - stopPos) / range;

    if (discrete && i > minStopIdx) grd.addColorStop(pct, prevColor);

    grd.addColorStop(pct, (prevColor = s[1]));
  }
  return grd;
}

export function getSeriesPathType(
  type: ShapeType,
  color: string,
  stepType?: StepType,
) {
  const defaultType = UPlot.paths.spline();
  return (
    {
      [ShapeType.Line]: {
        paths: stepType
          ? UPlot.paths.stepped({
              align: stepType === 'start' ? 1 : -1,
            })
          : defaultType,
      },
      [ShapeType.Area]: {
        paths: defaultType,
        fill: (u: UPlot, seriesIdx: number) => {
          const s = u.series[seriesIdx];
          const sc = u.scales[s.scale];
          return scaleGradient(u, s.scale, 1, [
            [sc.min, convertRgba(color, 0)],
            [sc.max * 2, color],
          ]);
        },
      },
      [ShapeType.Bar]: {
        paths: UPlot.paths.bars(),
        fill: color,
      },
      [ShapeType.Point]: {
        paths: UPlot.paths.points(),
      },
    }[type] || {
      paths: defaultType,
    }
  );
}
