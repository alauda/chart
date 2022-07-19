import * as d3 from 'd3';
import { BaseType } from 'd3';
import { get } from 'lodash';

import { CLASS_NAME, PIE_EVENTS, SCATTER_EVENTS } from '../../constant.js';
import { ChartData } from '../../types/index.js';
import { removeSymbol } from '../../utils/index.js';

import { TooltipStrategy } from './strategy.js';

export class ItemTooltipStrategy extends TooltipStrategy {
  registerPaths(paths: d3.Selection<BaseType, any, any, any>) {
    const tooltip = this.owner.getController('tooltip');
    const owner = this.owner;
    const { type } = owner.options;
    paths
      .on(
        'mouseover',
        function (
          event: MouseEvent,
          value: { pName: string; name: string; data: ChartData },
        ) {
          if (type === 'scatter') {
            const point = owner.chartEle.main.selectAll(
              `.${CLASS_NAME.scatter}-${removeSymbol(value.pName)} .${
                CLASS_NAME.scatterItem
              }-${removeSymbol(value.name)}`,
            );
            const r = point.attr('r');
            point
              .transition()
              .duration(200)
              .attr('stroke-width', 2)
              .attr('r', +r + 2)
              .attr('defaultR', r);
            owner.emit(SCATTER_EVENTS.ITEM_HOVERED, {
              self: this,
              event,
              data: value,
            });
          }
          if (value.data && type === 'pie') {
            owner.emit(PIE_EVENTS.ITEM_HOVERED, {
              self: this,
              event,
              data: value,
            });
          }
        },
      )
      .on('mousemove', (event: MouseEvent, res) => {
        const value = res as {
          data: ChartData;
          name: string;
          color: string;
          x: string;
          value: number;
        };
        if (!this.owner.noData && (value.data || value.name)) {
          const data = value.data || value;
          const margin = type === 'pie' ? 20 : -20;
          const offsetX = type === 'pie' ? 0 : -40;
          tooltip.setTooltipContext(
            {
              offsetX: event.offsetX + margin + offsetX,
              offsetY: event.offsetY + margin,
              event,
            },
            {
              title: type === 'scatter' ? '' : data?.name,
              values: [
                {
                  name: data.name,
                  color: data.color,
                  x: get(data, 'x') as string,
                  y: data.value,
                  activated: false,
                },
              ],
            },
          );
        }
      })
      .on(
        'mouseout',
        function (
          event: MouseEvent,
          value: { pName: string; name: string; data: ChartData },
        ) {
          if (value.data && type === 'pie') {
            owner.emit(PIE_EVENTS.ITEM_MOUSEOUT, {
              self: this,
              event,
              data: value,
            });
          }
          if (type === 'scatter') {
            const point = owner.chartEle.main.selectAll(
              `.${CLASS_NAME.scatter}-${removeSymbol(value.pName)} .${
                CLASS_NAME.scatterItem
              }-${removeSymbol(value.name)}`,
            );
            const dR = point.attr('defaultR');
            point
              .transition()
              .duration(200)
              .attr('stroke-width', 1)
              .attr('r', dR);

            owner.emit(SCATTER_EVENTS.ITEM_HOVERED, {
              self: this,
              event,
              data: value,
            });
          }
          tooltip?.setActive(null);
          tooltip?.setVisibility(false);
        },
      );
  }
}
