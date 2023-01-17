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
