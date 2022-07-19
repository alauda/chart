import { View } from '../../chart';
import { ChartData, D3Selection } from '../../types';

export abstract class TooltipStrategy {
  constructor(public owner: View) {}

  abstract registerPaths(
    paths?: d3.Selection<any, ChartData, any, any>,
    panel?: D3Selection,
  ): void;
}
