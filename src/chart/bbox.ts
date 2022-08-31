import { getPixel } from '../index.js';

// TODO: 后续支持 svg canvas 拍平类， 暂时用于创建 容器  计算大小
interface BBoxOption {
  container: HTMLElement;
  width: number;
  height: number;
}

export class BBox {
  container: HTMLElement;
  constructor({ container, width, height }: BBoxOption) {
    this.container = container;
    this.changeSize(width, height);
  }

  changeSize(width: number, height: number) {
    this.container.setAttribute('width', String(width));
    this.container.setAttribute('height', String(height));
    this.container.setAttribute(
      'style',
      `width: ${getPixel(width)}; height: ${getPixel(height)}`,
    );
  }
}
