import UPlot from 'uplot';

import { StepType } from '../components/shape/line.js';
import { ShapeOption } from '../types/index.js';
import { ShapeType } from '../utils/component.js';
import { convertRgba } from '../utils/index.js';
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
  options: ShapeOption,
  stepType?: StepType,
) {
  const defaultType = UPlot.paths.spline();
  const defaultOptions = {
    width: options.width ?? 1.5,
    alpha: options.alpha ?? 1,
  };
  const stroke = convertRgba(color, 1);
  return (
    {
      [ShapeType.Line]: {
        stroke,
        ...defaultOptions,
        paths: stepType
          ? UPlot.paths.stepped({
              align: stepType === 'start' ? 1 : -1,
            })
          : defaultType,
      },
      [ShapeType.Area]: {
        paths: defaultType,
        ...defaultOptions,
        stroke,
        fill: (u: UPlot, seriesIdx: number) => {
          const s = u.series[seriesIdx];
          const sc = u.scales[s.scale];
          return scaleGradient(u, s.scale, 1, [
            [sc.min, convertRgba(color, 0)],
            [sc.max / 2, convertRgba(color, 0.1)],
            [sc.max * 2, stroke],
          ]);
        },
      },
      [ShapeType.Bar]: {
        ...defaultOptions,
        paths: UPlot.paths.bars(),
        fill: color,
      },
      [ShapeType.Point]: {
        ...defaultOptions,
        stroke,
        paths: UPlot.paths.points(),
      },
    }[type] || {
      ...defaultOptions,
      paths: defaultType,
    }
  );
}

/** -------------------------------------------------------- */
let _context: CanvasRenderingContext2D;
const cache = new Map<string, TextMetrics>();
const cacheLimit = 500;
let ctxFontStyle = '';
export const UPLOT_AXIS_FONT_SIZE = 12;

// 计算最小网格和刻度间距
export function axesSpace(self: uPlot, axisIdx: number, scaleMin: number) {
  const axis = self.axes[axisIdx];
  const scale = self.scales[axis.scale!];

  // for axis left & right
  if (axis.side !== 2 || !scale) {
    return 30;
  }
  const defaultSpacing = 40;
  if (scale.time) {
    const width =
      measureText(String(scaleMin), UPLOT_AXIS_FONT_SIZE).width + 18;
    return width;
  }
  return defaultSpacing;
}

/**
 * @internal
 */
export function getCanvasContext() {
  if (!_context) {
    _context = document.createElement('canvas').getContext('2d')!;
  }
  return _context;
}
/**
 * @beta
 */
export function measureText(text: string, fontSize: number = 12): TextMetrics {
  const fontStyle = `${fontSize}px 'Roboto'`;
  const cacheKey = text + fontStyle;
  const fromCache = cache.get(cacheKey);

  if (fromCache) {
    return fromCache;
  }

  const context = getCanvasContext();

  if (ctxFontStyle !== fontStyle) {
    context.font = ctxFontStyle = fontStyle;
  }

  const metrics = context.measureText(text);

  if (cache.size === cacheLimit) {
    cache.clear();
  }

  cache.set(cacheKey, metrics);

  return metrics;
}
