/**
 * @internal
 */
let _context: CanvasRenderingContext2D;
export function getCanvasContext() {
  if (!_context) {
    _context = document.createElement('canvas').getContext('2d')!;
  }
  return _context;
}


export function getOpacityGradientFn(
  color: string,
  opacity: number,
): (self: uPlot, seriesIdx: number) => CanvasGradient {
  return (plot: uPlot, _seriesIdx: number) => {
    const ctx = getCanvasContext();
    const gradient = makeDirectionalGradient(
      plot.scales.x!.ori === ScaleOrientation.Horizontal
        ? GradientDirection.Down
        : GradientDirection.Left,
      plot.bbox,
      ctx,
    );

    gradient.addColorStop(0, alpha(color, opacity));
    gradient.addColorStop(1, alpha(color, 0));

    return gradient;
  };
}

export function alpha(color: string, value: number) {
  if (color === '') {
    return '#000000';
  }

  value = clamp(value);

  // hex 3, hex 4 (w/alpha), hex 6, hex 8 (w/alpha)
  if (color[0] === '#') {
    if (color.length === 9) {
      color = color.substring(0, 7);
    } else if (color.length <= 5) {
      let c = '#';
      for (let i = 1; i < 4; i++) {
        c += color[i] + color[i];
      }
      color = c;
    }

    return (
      color +
      Math.round(value * 255)
        .toString(16)
        .padStart(2, '0')
    );
  }
  // rgb(, hsl(
  else if (color[3] === '(') {
    // rgb() and hsl() do not require the "a" suffix to accept alpha values in modern browsers:
    // https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/rgb()#accepts_alpha_value
    return color.replace(')', `, ${value})`);
  }
  // rgba(, hsla(
  else if (color[4] === '(') {
    return color.substring(0, color.lastIndexOf(',')) + `, ${value})`;
  }

  const parts = decomposeColor(color);

  if (parts.type === 'color') {
    parts.values[3] = `/${value}`;
  } else {
    parts.values[3] = value;
  }

  return recomposeColor(parts);
}

interface DecomposeColor {
  type: string;
  values: any;
  colorSpace?: string;
}

/**
 * Converts a color object with type and values to a string.
 * @param {object} color - Decomposed color
 * @param color.type - One of: 'rgb', 'rgba', 'hsl', 'hsla'
 * @param {array} color.values - [n,n,n] or [n,n,n,n]
 * @returns A CSS color string
 * @beta
 */
export function recomposeColor(color: DecomposeColor) {
  const { type, colorSpace } = color;
  let values = color.values;

  if (type.indexOf('rgb') !== -1) {
    // Only convert the first 3 values to int (i.e. not alpha)
    values = values.map((n: string, i: number) =>
      i < 3 ? parseInt(n, 10) : n,
    );
  } else if (type.indexOf('hsl') !== -1) {
    values[1] = `${values[1]}%`;
    values[2] = `${values[2]}%`;
  }
  if (type.indexOf('color') !== -1) {
    values = `${colorSpace} ${values.join(' ')}`;
  } else {
    values = `${values.join(', ')}`;
  }

  return `${type}(${values})`;
}

export enum GradientDirection {
  Right = 0,
  Up = 1,
  Left = 2,
  Down = 3,
}

export enum ScaleOrientation {
  Horizontal = 0,
  Vertical = 1,
}

function makeDirectionalGradient(
  direction: GradientDirection,
  bbox: uPlot.BBox,
  ctx: CanvasRenderingContext2D,
) {
  let x0 = 0,
    y0 = 0,
    x1 = 0,
    y1 = 0;

  if (direction === GradientDirection.Down) {
    y0 = bbox.top;
    y1 = bbox.top + bbox.height;
  } else if (direction === GradientDirection.Left) {
    x0 = bbox.left + bbox.width;
    x1 = bbox.left;
  } else if (direction === GradientDirection.Up) {
    y0 = bbox.top + bbox.height;
    y1 = bbox.top;
  } else if (direction === GradientDirection.Right) {
    x0 = bbox.left;
    x1 = bbox.left + bbox.width;
  }

  return ctx.createLinearGradient(x0, y0, x1, y1);
}

export function decomposeColor(color: string | DecomposeColor): DecomposeColor {
  // Idempotent
  if (typeof color !== 'string') {
    return color;
  }

  if (color.charAt(0) === '#') {
    return decomposeColor(hexToRgb(color));
  }

  const marker = color.indexOf('(');
  const type = color.substring(0, marker);

  if (['rgb', 'rgba', 'hsl', 'hsla', 'color'].indexOf(type) === -1) {
    throw new Error(
      `Unsupported '${color}' color. The following formats are supported: #nnn, #nnnnnn, rgb(), rgba(), hsl(), hsla(), color()`,
    );
  }

  let values: any = color.substring(marker + 1, color.length - 1);
  let colorSpace;

  if (type === 'color') {
    values = values.split(' ');
    colorSpace = values.shift();
    if (values.length === 4 && values[3].charAt(0) === '/') {
      values[3] = values[3].slice(1);
    }
    if (
      ['srgb', 'display-p3', 'a98-rgb', 'prophoto-rgb', 'rec-2020'].indexOf(
        colorSpace,
      ) === -1
    ) {
      throw new Error(
        `Unsupported ${colorSpace} color space. The following color spaces are supported: srgb, display-p3, a98-rgb, prophoto-rgb, rec-2020.`,
      );
    }
  } else {
    values = values.split(',');
  }

  values = values.map((value: string) => parseFloat(value));
  return { type, values, colorSpace };
}

export function hexToRgb(color: string) {
  color = color.slice(1);

  const re = new RegExp(`.{1,${color.length >= 6 ? 2 : 1}}`, 'g');
  let result = color.match(re);

  if (!result) {
    return '';
  }

  let colors = Array.from(result);

  if (colors[0].length === 1) {
    colors = colors.map(n => n + n);
  }

  return colors
    ? `rgb${colors.length === 4 ? 'a' : ''}(${colors
        .map((n, index) => {
          return index < 3
            ? parseInt(n, 16)
            : Math.round((parseInt(n, 16) / 255) * 1000) / 1000;
        })
        .join(', ')})`
    : '';
}

function clamp(value: number, min = 0, max = 1) {
  if (process.env.NODE_ENV !== 'production') {
    if (value < min || value > max) {
      console.error(`The value provided ${value} is out of range [${min}, ${max}].`);
    }
  }

  return Math.min(Math.max(min, value), max);
}
