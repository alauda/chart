import uPlot, { Axis, SidesWithAxes } from 'uplot';

export function axisAutoSize(
  u: uPlot,
  values: number[],
  axisIdx: number,
  cycleNum: number,
) {
  const axis: any = u.axes[axisIdx];

  if (cycleNum > 1) return axis._size;

  let axisSize = axis.ticks.size + axis.gap;

  const longestVal = (values ?? []).reduce(
    (acc, val: any) => (val.length > acc.length ? val : acc),
    '',
  );

  if (longestVal !== '') {
    u.ctx.font = axis.font[0];
    axisSize += u.ctx.measureText(longestVal).width / devicePixelRatio;
  }
  return Math.ceil(axisSize + 2);
}

export function autoPadRight(right = 8): uPlot.PaddingSide {
  return (
    self: any,
    _side: Axis.Side,
    _sidesWithAxes: SidesWithAxes,
    cycleNum: number,
  ) => {
    const xAxis = self.axes[0];
    const xVals = xAxis._values;

    if (xVals != null) {
      // bail out, force convergence
      if (cycleNum > 2) return self._padding[1];

      const xSplits = xAxis._splits;
      const rightSplit = xSplits[xSplits.length - 1];
      const rightSplitCoord = self.valToPos(rightSplit, 'x');
      const leftPlotEdge = self.bbox.left / devicePixelRatio;
      const rightPlotEdge = leftPlotEdge + self.bbox.width / devicePixelRatio;
      const rightChartEdge = rightPlotEdge + self._padding[1];

      const pxPerChar = right;
      const rightVal = xVals[xVals.length - 1] + '';
      const valHalfWidth = pxPerChar * (rightVal.length / 2);

      const rightValEdge = leftPlotEdge + rightSplitCoord + valHalfWidth;

      if (rightValEdge >= rightChartEdge) {
        return rightValEdge - rightPlotEdge;
      }
    }

    return right;
  };
}
