/**
 * 十六进制转换为 RGBA
 * @param hex
 * @param alpha
 * @see https://stackoverflow.com/questions/21646738/convert-hex-to-rgba
 * @see https://github.com/bgrins/TinyColor
 * @returns string rgba
 */

import { trim } from 'lodash';

// eslint-disable-next-line regexp/no-unused-capturing-group
const isValidHex = (hex: string) => /^#([\dA-Fa-f]{3,4}){1,2}$/.test(hex);

const convertHexUnitTo256 = (hexStr: string) =>
  parseInt(hexStr.repeat(2 / hexStr.length), 16);

const getAlphafloat = (a: number, alpha: number) => {
  if (typeof a !== 'undefined') {
    return a / 255;
  }
  if (typeof alpha !== 'number' || alpha < 0 || alpha > 1) {
    return 1;
  }
  return alpha;
};

export function convertRgba(hex: string, alpha = 1) {
  if (hex.includes('var')) {
    const varColorStr = hex.replace(/^rgb\(var\(*/, '').replace(/\)\)/, '');
    const varColor = getComputedStyle(document.body).getPropertyValue(
      varColorStr,
    );
    const [r, g, b] = varColor.split(',').map(d => trim(d));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (!isValidHex(hex)) {
    return hex;
  }
  const chunkSize = Math.floor((hex.length - 1) / 3);
  const hexArr = hex.slice(1).match(new RegExp(`.{${chunkSize}}`, 'g'));
  const [r, g, b, a] = hexArr.map(convertHexUnitTo256);
  return `rgba(${r}, ${g}, ${b}, ${getAlphafloat(a, alpha)})`;
}
