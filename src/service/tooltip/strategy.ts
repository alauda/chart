import { View } from '../../chart/index.js';
import { ChartData, D3Selection } from '../../types/index.js';

export abstract class TooltipStrategy {
  constructor(public owner: View) {}

  abstract registerPaths(
    paths?: d3.Selection<any, ChartData, any, any>,
    panel?: D3Selection,
  ): void;
}
