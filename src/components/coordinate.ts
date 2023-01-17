import uPlot from 'uplot';

export class Coordinate {
  name = 'coordinate';

  isTransposed = false;

  render() {
    // ..
  }

  update() {
    // ..
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
