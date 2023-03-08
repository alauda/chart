import { get } from 'lodash';
import uPlot from 'uplot';
import { View } from '../chart/view.js';
import { CoordinateOpt } from '../types/index.js';

export class Coordinate {
  name = 'coordinate';

  isTransposed = false;

  ctrl: View;

  option: CoordinateOpt;

  constructor(ctrl: View) {
    this.ctrl = ctrl;
  }

  render() {
    // ..
    this.setOption();
  }

  update() {
    // ..
    this.setOption();
  }

  setOption() {
    this.option = get(this.ctrl.getOption(), this.name);
    this.isTransposed = this.option.transposed;
  }

  transpose() {
    this.isTransposed = true;
  }

  getOptions(): {
    scales?: {
      [key: string]: uPlot.Scale;
    };
    axes?: uPlot.Axis[];
  } {
    return this.isTransposed
      ? {
          scales: {
            y: {
              ori: 0,
            },
          },
          axes: [
            {},
            {
              side: 2,
            },
          ],
        }
      : {};
  }
}
