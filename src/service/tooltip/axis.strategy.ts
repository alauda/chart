import * as d3 from 'd3';
import { BaseType, NumberValue, ScalePoint } from 'd3';

import {
  ACTIVE_STROKE_WIDTH,
  CLASS_NAME,
  CLONE_PATCH_EVENTS,
  DEFAULT_LINE_WIDTH,
  RECT_EVENTS,
  STROKE_WIDTH,
} from '../../constant.js';
import {
  ChartData,
  D3Selection,
  LineSeriesOption,
  Nilable,
} from '../../types/index.js';
import {
  findClosestPointIndex,
  getPos,
  removeSymbol,
} from '../../utils/index.js';

import { TooltipStrategy } from './strategy.js';

export class AxisTooltipStrategy extends TooltipStrategy {
  registerPaths(
    paths: d3.Selection<BaseType, ChartData, any, any>,
    panel: D3Selection,
  ) {
    const tooltip = this.owner.getController('tooltip');
    const options = this.owner.options;
    panel
      .on('click', (event: MouseEvent) => {
        const target = event.target as SVGElement;
        const isTarget =
          target.nodeName === 'path' ||
          Array.from(target.classList).includes(CLASS_NAME.barItem);
        const eventDom = isTarget
          ? (this.owner.chartEle.main
              .selectAll(`.${CLASS_NAME.eventRect} rect`)
              .node() as HTMLElement)
          : null;
        const { index: closestIndex, value: xValue } = this.getCurrentParams(
          event,
          eventDom,
        );
        const value = tooltip.getTooltipContext(closestIndex, xValue);
        this.owner.emit(RECT_EVENTS.CLICK, value);
      })
      .on('mousedown', (event: MouseEvent) => {
        this.owner.emit(RECT_EVENTS.MOUSEDOWN, event);
      })
      .on('mouseup', (event: MouseEvent) => {
        this.owner.emit(RECT_EVENTS.MOUSEUP, event);
      })
      .on('mousemove', (event: MouseEvent) => {
        if (this.owner.noData) {
          tooltip?.setVisibility(false);
          return;
        }
        const target = event.target as SVGElement;
        const isTarget =
          target.nodeName === 'path' ||
          Array.from(target.classList).includes(CLASS_NAME.barItem);
        const eventDom = isTarget
          ? (this.owner.chartEle.main
              .selectAll(`.${CLASS_NAME.eventRect} rect`)
              .node() as HTMLElement)
          : null;
        const yPos = getPos(event, !this.owner.isRotated, eventDom);
        tooltip?.setVisibility(true);
        const scale = this.owner.getController('scale');
        const {
          index: closestIndex,
          value: xValue,
          xPos,
        } = this.getCurrentParams(event, eventDom);
        const width = this.owner.isBar
          ? (scale.x as ScalePoint<string>).bandwidth() / 2
          : 0;
        if (!this.owner.isBar) {
          tooltip.updateCrosshairLine((scale.x(xValue) || 0) + width);
        }
        tooltip.setTooltipContext(
          { offsetX: xPos, offsetY: yPos, event },
          tooltip.getTooltipContext(closestIndex, xValue),
        );
        this.owner.emit(RECT_EVENTS.MOUSEMOVE, event);
      })
      .on('mouseout', () => {
        this.owner.chartEle.main
          .selectAll(`.${CLASS_NAME.line}`)
          .selectAll('path')
          .attr(
            STROKE_WIDTH,
            (this.owner.options.seriesOption as Nilable<LineSeriesOption>)
              ?.lineWidth || DEFAULT_LINE_WIDTH,
          );
        tooltip?.setActive(null);
        tooltip?.setVisibility(false);
      });
    paths
      .on('mousedown', (event: MouseEvent) => {
        this.owner.emit(CLONE_PATCH_EVENTS.MOUSEDOWN, event);
      })
      .on('mouseup', (event: MouseEvent) => {
        this.owner.emit(CLONE_PATCH_EVENTS.MOUSEUP, event);
      })
      .on('mouseover', (event: MouseEvent, d) => {
        const name = d.name;
        const seriesOpt = options as LineSeriesOption;
        this.owner.emit(CLONE_PATCH_EVENTS.MOUSEMOVE, event);
        this.owner.chartEle.main
          .selectAll(
            `.${CLASS_NAME.line}:not(.${CLASS_NAME.line}-${removeSymbol(
              name,
            )})`,
          )
          .selectAll('path')
          .attr('opacity', 0.3);
        this.owner.chartEle.main
          .selectAll(`.${CLASS_NAME.line}-${removeSymbol(name)}`)
          .selectAll('path')
          .attr(STROKE_WIDTH, seriesOpt.activeLineWidth || ACTIVE_STROKE_WIDTH);
        tooltip?.setActive(name);
      })
      .on('mouseout', () => {
        this.owner.chartEle.main
          .selectAll(`.${CLASS_NAME.line}`)
          .selectAll('path')
          .attr(
            STROKE_WIDTH,
            (this.owner.options.seriesOption as Nilable<LineSeriesOption>)
              ?.lineWidth || DEFAULT_LINE_WIDTH,
          )
          .attr('opacity', 1);
        tooltip?.setActive(null);
      });
  }

  private getCurrentParams(event: MouseEvent, rectDom?: HTMLElement) {
    const tooltip = this.owner.getController('tooltip');
    const xPos = getPos(event, tooltip.isRotated, rectDom);
    const scale = this.owner.getController('scale');
    const closestIndex = findClosestPointIndex(
      xPos,
      this.owner,
      tooltip.isRotated,
    );
    const value = (
      this.owner.isBar ? scale.xBarSeriesValue : scale.xSeriesValue
    )[closestIndex] as string & (NumberValue & (Date | NumberValue));
    return { index: closestIndex, value, xPos };
  }
}
