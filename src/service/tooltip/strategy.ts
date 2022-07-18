import View from '../../chart/view';
import { ChartData, D3Selection } from '../../types';

export abstract class TooltipStrategy {
  owner: View;
  constructor(owner: View) {
    this.owner = owner;
  }

  abstract registerPaths(
    paths?: d3.Selection<any, ChartData, any, any>,
    panel?: D3Selection,
  ): void;
}
