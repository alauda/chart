import { drag, DragBehavior, NumberValue } from 'd3';
import { get } from 'lodash';

import { UIController } from '../abstract';
import { View } from '../chart';
import { CLASS_NAME, CLONE_PATCH_EVENTS, RECT_EVENTS } from '../constant';
import { D3Selection, Nilable, ZoomOption } from '../types';
import { findClosestPointIndex, getPos } from '../utils';

export interface AreaParams {
  x: number;
  value: {
    x: number;
    y: string | number;
  };
}

export class Zoom extends UIController<ZoomOption> {
  container: Nilable<D3Selection>;

  behaviour: DragBehavior<Element, unknown, unknown>;

  eventRect: D3Selection;

  private open = false;

  private start = 0;

  private end = 0;

  get name() {
    return 'zoom';
  }

  get isRotated() {
    return !!this.owner.isRotated;
  }

  constructor(view: View) {
    super(view);
    this.option = view.options.zoom;
  }

  init() {
    this.container = this.owner.chartEle.main
      .append('rect')
      .attr('class', CLASS_NAME.zoomBrush)
      .style('pointer-events', 'none');

    this.initZoomBehaviour();
    this.bindZoomOnEventRect();
  }

  render() {
    // ..
  }

  // TODO: drag 会组织原有事件 mousemove 等,
  // 暂时通过 监听 rect 事件触发 drag   @zhaoyongping
  initZoomBehaviour() {
    let start = 0;
    let end = 0;
    this.behaviour = drag()
      .clickDistance(4)
      .on('start', (e: DragEvent) => {
        const event = get(e, 'sourceEvent') as MouseEvent;
        const params = this.getContext(event);
        start = params.x;
        this.option?.onzoomStart(params);
        this.container
          .attr('x', params.x)
          .attr('height', this.owner.size.main.height);
      })
      .on('drag', (e: DragEvent) => {
        const event = get(e, 'sourceEvent') as MouseEvent;
        const params = this.getContext(event);
        this.option?.onzoom?.(params);
        end = params.x;
        const value = Math.abs(end - start);

        this.container.attr('x', end < start ? start - value : start);

        this.container.attr('width', value);
      })
      .on('end', e => {
        const event = get(e, 'sourceEvent') as MouseEvent;
        this.option?.onzoomEnd?.(this.getContext(event));
        this.container.attr('width', 0).attr('x', 0);
      });
  }

  bindZoomOnEventRect() {
    this.owner.on(RECT_EVENTS.MOUSEDOWN, this.dragStart);

    this.owner.on(RECT_EVENTS.MOUSEMOVE, this.drag);

    this.owner.on(RECT_EVENTS.MOUSEUP, this.dragEnd);

    this.owner.on(CLONE_PATCH_EVENTS.MOUSEDOWN, this.dragStart);

    this.owner.on(CLONE_PATCH_EVENTS.MOUSEMOVE, this.drag);

    this.owner.on(CLONE_PATCH_EVENTS.MOUSEUP, this.dragEnd);
  }

  private readonly dragStart = (event: MouseEvent) => {
    this.open = true;
    const params = this.getContext(event);
    this.start = params.x;
    this.option?.onzoomStart(params);
    this.container
      .attr('x', params.x)
      .attr('height', this.owner.size.main.height);
  };

  private readonly drag = (event: MouseEvent) => {
    if (this.open) {
      const params = this.getContext(event);
      this.option?.onzoom?.(params);
      this.end = params.x;
      const value = Math.abs(this.end - this.start);

      this.container.attr(
        'x',
        this.end < this.start ? this.start - value : this.start,
      );

      this.container.attr('width', value);
    }
  };

  private readonly dragEnd = (event: MouseEvent) => {
    this.open = false;
    this.option?.onzoomEnd?.(this.getContext(event));
    this.container.attr('width', 0).attr('x', 0);
  };

  private readonly getContext = (event: MouseEvent): AreaParams => {
    const scale = this.owner.getController('scale');
    const xPos = getPos(event, this.isRotated);
    const closestIndex = findClosestPointIndex(
      xPos,
      this.owner,
      this.isRotated,
    );
    const x = scale.xSeriesValue[closestIndex] as string &
      number &
      (NumberValue & (Date | NumberValue));
    return {
      x: xPos,
      value: {
        x,
        y: scale.x(x),
      },
    };
  };

  destroy() {
    this.container?.remove();
  }
}
