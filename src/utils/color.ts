const HEXADECIMAL = 16;

/**
 * 十六进制转换为 RGBA
 * @param hex
 * @param alpha
 * @see https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
 * @returns string rgba
 */
export function convertRgba(hex: string, alpha = 1) {
  const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, HEXADECIMAL));
  return `rgba(${r},${g},${b},${alpha})`;
}
