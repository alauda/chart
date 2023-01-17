import { View } from '../chart/view.js';

export type InteractionCtor = new (view: View, opt: unknown) => Interaction;

/**
 * 交互的基类。
 */
export default class Interaction {
  update() {
    console.log('inter');
  }
}
