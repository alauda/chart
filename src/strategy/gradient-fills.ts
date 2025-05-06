import { Annotation } from '../components/annotation.js';
import { AnnotationLineOption } from '../types/options.js';
import { getCanvasContext } from './color-untils.js';
import tinycolor from 'tinycolor2';

export enum ScaleOrientation {
  Horizontal = 0,
  Vertical = 1,
}

export function addAreas(
  u: uPlot,
  yScaleKey: string,
  steps: AnnotationLineOption[],
  self: Annotation,
) {
  let ctx = u.ctx;
  let grd = scaleGradient(
    u,
    yScaleKey,
    steps.map(step => {
      let color = tinycolor(
        step.style?.stroke || self.ctrl.getTheme().colorVar.red,
      );

      if (color.getAlpha() === 1) {
        color.setAlpha(0.15);
      }

      return [+step.data, color.toString()];
    }),
    true,
  );

  ctx.fillStyle = grd;
  ctx.fillRect(u.bbox.left, u.bbox.top, u.bbox.width, u.bbox.height);
}

type ValueStop = [value: number, color: string];

type ScaleValueStops = ValueStop[];

export function scaleGradient(
  u: uPlot,
  scaleKey: string,
  scaleStops: ScaleValueStops,
  discrete = false,
) {
  let scale = u.scales[scaleKey];

  // we want the stop below or at the scaleMax
  // and the stop below or at the scaleMin, else the stop above scaleMin
  let minStopIdx: number | null = null;
  let maxStopIdx: number | null = null;

  for (let i = 0; i < scaleStops.length; i++) {
    let stopVal = scaleStops[i][0];

    if (stopVal <= scale.min! || minStopIdx == null) {
      minStopIdx = i;
    }

    maxStopIdx = i;

    if (stopVal >= scale.max!) {
      break;
    }
  }

  if (minStopIdx === maxStopIdx) {
    return scaleStops[minStopIdx!][1];
  }

  let minStopVal = scaleStops[minStopIdx!][0];
  let maxStopVal = scaleStops[maxStopIdx!][0];

  if (minStopVal === -Infinity) {
    minStopVal = scale.min!;
  }

  if (maxStopVal === Infinity) {
    maxStopVal = scale.max!;
  }

  let minStopPos = Math.round(u.valToPos(minStopVal, scaleKey, true));
  let maxStopPos = Math.round(u.valToPos(maxStopVal, scaleKey, true));

  let range = minStopPos - maxStopPos;

  if (range === 0) {
    return scaleStops[maxStopIdx!][1];
  }

  let x0, y0, x1, y1;

  if (u.scales.x!.ori === ScaleOrientation.Horizontal) {
    x0 = x1 = 0;
    y0 = minStopPos;
    y1 = maxStopPos;
  } else {
    y0 = y1 = 0;
    x0 = minStopPos;
    x1 = maxStopPos;
  }

  let ctx = getCanvasContext();
  let grd = ctx.createLinearGradient(x0, y0, x1, y1 || 0);

  let prevColor: string;

  for (let i = minStopIdx!; i <= maxStopIdx!; i++) {
    let s = scaleStops[i];

    let stopPos =
      i === minStopIdx
        ? minStopPos
        : i === maxStopIdx
        ? maxStopPos
        : Math.round(u.valToPos(s[0], scaleKey, true));

    let pct = (minStopPos - stopPos) / range;

    if (discrete && i > minStopIdx!) {
      grd.addColorStop(pct, prevColor!);
    }

    grd.addColorStop(pct, (prevColor = s[1]));
  }

  return grd;
}

export function addLines(
  u: uPlot,
  yScaleKey: string,
  steps: AnnotationLineOption[],
  self: Annotation,
) {
  let ctx = u.ctx;

  // Thresholds below a transparent threshold is treated like "less than", and line drawn previous threshold
  let transparentIndex = 0;

  for (let idx = 0; idx < steps.length; idx++) {
    const step = steps[idx];
    if (step.style?.stroke === 'transparent') {
      transparentIndex = idx;
      break;
    }
  }

  ctx.lineWidth = 2;

  // Ignore the base -Infinity threshold by always starting on index 1
  for (let idx = 1; idx < steps.length; idx++) {
    if (steps[idx]?.style?.line) {
      return;
    }
    const step = steps[idx];
    let color: tinycolor.Instance;

    const cColor = self.ctrl.getTheme().colorVar.red;

    // if we are below a transparent index treat this a less then threshold, use previous thresholds color
    if (transparentIndex >= idx && idx > 0) {
      color = tinycolor(steps[idx - 1]?.style?.stroke || cColor);
    } else {
      color = tinycolor(step.style?.stroke || cColor);
    }

    // Unless alpha specififed set to default value
    if (color.getAlpha() === 1) {
      color.setAlpha(0.7);
    }

    let x0 = Math.round(u.bbox.left);
    let y0 = Math.round(u.valToPos(+step.data, yScaleKey, true));
    let x1 = Math.round(u.bbox.left + u.bbox.width);
    let y1 = Math.round(u.valToPos(+step.data, yScaleKey, true));
    if (step?.style?.lineDash) {
      ctx.setLineDash(step?.style?.lineDash);
    }
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);

    ctx.strokeStyle = color.toString();
    ctx.stroke();
  }
}
