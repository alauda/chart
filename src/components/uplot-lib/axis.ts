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
    let xAxis = self.axes[0] as any;
    let xVals = xAxis._values;

    if (xVals != null) {
      // bail out, force convergence
      if (cycleNum > 2) return self._padding[1];

      let xSplits = xAxis._splits;
      let rightSplit = xSplits[xSplits.length - 1];
      let rightSplitCoord = self.valToPos(rightSplit, 'x');
      let leftPlotEdge = self.bbox.left / devicePixelRatio;
      let rightPlotEdge = leftPlotEdge + self.bbox.width / devicePixelRatio;
      let rightChartEdge = rightPlotEdge + self._padding[1];

      let pxPerChar = right;
      let rightVal = xVals[xVals.length - 1] + '';
      let valHalfWidth = pxPerChar * (rightVal.length / 2);

      let rightValEdge = leftPlotEdge + rightSplitCoord + valHalfWidth;

      if (rightValEdge >= rightChartEdge) {
        return rightValEdge - rightPlotEdge;
      }
    }

    return right;
  };
}
