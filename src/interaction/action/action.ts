import { View } from '../../chart/view.js';

/**
 * Action 基类
 */
export abstract class Action {
  view: View;

  abstract get name(): string;

  constructor(view: View) {
    this.view = view;
  }
}
