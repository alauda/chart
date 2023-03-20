import { cloneDeep, merge, mergeWith, omit, isFunction } from 'lodash';
import UPlot from 'uplot';
import { Annotation } from '../components/annotation.js';

import { Axis } from '../components/axis.js';
import { Tooltip } from '../components/index.js';
import { Scale } from '../components/scale.js';
import { autoPadRight } from '../components/uplot-lib/axis.js';
import { ChartEvent, Data, LegendItemActive, Size } from '../types/index.js';
import { generateName, SHAPE_TYPES } from '../utils/index.js';

import { ViewStrategy } from './abstract.js';
import { UPLOT_DEFAULT_OPTIONS } from './config.js';
import { Quadtree } from './quadtree.js';

export interface MarkContext {
  title: Date | number | string;
  values: MarkContextItem[];
}

export interface MarkContextItem {
  name: string;
  color: string;
  x: string;
  y: number;
  activated?: boolean;
}

export interface BrushContext {
  start: number;
  end: number;
}

const SHAPES = SHAPE_TYPES;
/**
 * 渲染策略
 * uPlot 渲染图表
 */
export class UPlotViewStrategy extends ViewStrategy {
  shapes = SHAPES;

  qt: Quadtree;

  private cursor: HTMLElement;

  get name(): string {
    return 'uPlot';
  }

  get component(): string[] {
    return ['axis', 'scale', 'tooltip', 'annotation', ...SHAPES];
  }

  private uPlot: uPlot;

  get isElementAction() {
    return this.ctrl.isElementAction;
  }

  private recordActive = false;

  activeId: number;

  init() {
    this.getChartEvent();
  }

  /**
   * 监听 chart 事件
   */
  getChartEvent() {
    // 监听 主题改变
    this.ctrl.on(ChartEvent.THEME_CHANGE, () => {
      if (this.uPlot) {
        this.uPlot.redraw();
      }
    });

    // 监听 legend item click
    this.ctrl.on(ChartEvent.LEGEND_ITEM_CLICK, (data: LegendItemActive) => {
      if (this.uPlot) {
        this.uPlot.setSeries(data.index + 1, { show: !data.isActive }, true);
      }
    });

    this.ctrl.on(ChartEvent.DATA_CHANGE, () => {
      if (this.uPlot) {
        this.uPlot.redraw();
        const data = this.getData();
        const ySeries = this.uPlot.series.filter(s => s.scale === 'y');
        const series = this.getSeries();
        ySeries.forEach((s: uPlot.Series) => {
          if (series.every(d => d.label !== s.label)) {
            this.uPlot.delSeries(
              this.uPlot.series.findIndex(res => res.label === s.label),
            );
          }
        });

        this.getSeries().forEach((s: uPlot.Series, index) => {
          const no = ySeries.every(d => d.label !== s.label);
          if (no && index) {
            this.uPlot.addSeries(s, this.uPlot.series.length);
          }
        });
        this.uPlot.setData(data);
        const legend = this.ctrl.components.get('legend');
        legend.update();
      }
    });

    this.ctrl.on(ChartEvent.HOOKS_REDRAW, () => {
      this.uPlot.redraw();
    });
  }

  render(size?: Size) {
    const option = this.getOption();
    const data = option.data?.length ? option.data : this.getData();
    if (!this.uPlot) {
      this.uPlot = new UPlot(option, data, this.ctrl.container);
    }
    this.changeSize(size || this.ctrl.size);
  }

  /**
   * 修改 uPlot 视图大小
   * @param size 宽 高
   */
  private changeSize(size: Size) {
    // TODO: 设置 uPlot padding 留空间给header  header 使用 position 定位
    const headerH =
      this.ctrl.chartContainer.querySelector(`.${generateName('header')}`)
        ?.clientHeight || 0;
    this.uPlot.setSize({ ...size, height: size.height - headerH });
    // if (this.ctrl.getData().length) {
    //   this.uPlot.redraw(false);
    // }
  }

  /**
   * 获取 uPlot 配置
   * 将原始 option 转换 uPlot 配置
   */
  private readonly getOption = (): uPlot.Options => {
    const { width, height } = this.ctrl.size;
    const ctrlOption = this.ctrl.getOption();
    const series = this.getSeries();
    const theme = this.getThemeOption();
    const plugins = this.getPlugins();
    const shapeOptions = this.getShapeChartOption();
    const coordinate = this.ctrl.coordinateInstance.getOptions();
    const axis = (this.ctrl.components.get('axis') as Axis).getOptions();
    const scale = (this.ctrl.components.get('scale') as Scale).getOptions();
    const annotation = (
      this.ctrl.components.get('annotation') as Annotation
    ).getOptions();
    const interaction = this.getInteractionOption();
    const [dt, dr, db, dl] =
      ctrlOption.padding || UPLOT_DEFAULT_OPTIONS.padding;
    const paddingRight = isFunction(dr) ? dr : autoPadRight(dr);
    const source = {
      width,
      height: height + 90,
      ...cloneDeep(UPLOT_DEFAULT_OPTIONS),
      padding: [dt, paddingRight, db, dl],
      plugins,
      // fmtDate: () => UPlot.fmtDate('{HH}:{mm}'),
      hooks: {
        drawClear: [
          (u: uPlot) => {
            this.qt =
              this.qt || new Quadtree(0, 0, u.bbox.width, u.bbox.height);
            this.qt.clear();
          },
        ],
        setSeries: [
          (_u: uPlot, id: number) => {
            this.activeId = id;
          },
        ],
        ready: [
          (u: uPlot) => {
            this.cursor = document.createElement('div');
            this.cursor.className = 'cursor';
            this.cursor.style.position = 'absolute';
            this.cursor.style.top = '0';
            this.cursor.style.left = '0';
            u.over.append(this.cursor);
            this.ctrl.emit(ChartEvent.U_PLOT_READY);
          },
        ],
      },
      series,
    };
    const op = mergeWith(
      source,
      coordinate,
      annotation,
      axis,
      scale,
      theme,
      shapeOptions,
      interaction,
      (objValue: unknown, srcValue: unknown, key: string) => {
        if (Array.isArray(objValue) && Array.isArray(srcValue)) {
          if (key === 'plugins') {
            return objValue.concat(srcValue);
          }
          if (key === 'axes') {
            return merge(objValue, srcValue);
          }
          const objLonger = objValue.length > srcValue.length;
          const source = objLonger ? objValue : srcValue;
          const minSource = objLonger ? srcValue : objValue;
          return source.map((value: unknown, index) =>
            merge(value, minSource[index]),
          );
        }
      },
    );
    return op;
  };

  /**
   * 获取数据
   * 原始数据转换为 uPlot 数据
   * @returns uPlot.AlignedData
   */
  getData(): uPlot.AlignedData {
    const data = this.ctrl.getData();
    return this.handleData(data);
  }

  /**
   * 将数据处理成 uPlot 数据格式
   * @param data 源数据
   * @returns uPlot 数据源哥是
   */
  handleData(data: Data): uPlot.AlignedData {
    if (!data.length) {
      return [];
    }
    const values = data.map(value => value.values);
    // type-coverage:ignore-next-line
    const x = values[0].map(value => value.x);
    const yItem = values.map(data => data.map(d => d.y));
    return [x, ...yItem];
  }

  /**
   * 获取 series
   * @param data 源数据
   * @returns uPlot series
   */
  getSeries() {
    const shapeSeries = this.shapes.reduce((prev, name) => {
      const comp = this.ctrl.shapeComponents.get(name);
      return comp ? [comp.getSeries(), ...prev] : prev;
    }, []);

    // console.log('shapeComp', shapeSeries.flat());
    return [{}, ...shapeSeries.flat()];
  }

  /**
   * 获取 shape uPlot 配置
   * @returns uPlot option
   */
  getShapeChartOption() {
    return this.shapes.reduce((prev, name) => {
      const comp = this.ctrl.shapeComponents.get(name);
      return comp ? merge(prev, comp.getOptions()) : prev;
    }, {});
  }

  getInteractionOption() {
    return {
      cursor: {
        bind: {
          // 始终开启 drag x 根据 interaction brush x 是否开启触发 handle
          mousedown: (
            _u: uPlot,
            _t: HTMLElement,
            handler: (e: MouseEvent) => null,
          ) => {
            return (e: MouseEvent) => {
              if (this.ctrl.interactions.get('brush-x')) {
                handler(e);
              }
            };
          },
        },
        drag: {
          x: true,
        },
      },
    };
  }

  /**
   * 获取主题 配置
   */
  getThemeOption() {
    if (!this.ctrl.getTheme()) {
      return;
    }
    return {
      axes: [
        {
          stroke: () => this.ctrl.getTheme().xAxis.stroke,
          ticks: {
            stroke: () => this.ctrl.getTheme().xAxis.tickStroke,
          },
          border: {
            stroke: () => this.ctrl.getTheme().xAxis.tickStroke,
          },
        },
        {
          stroke: () => this.ctrl.getTheme().yAxis.stroke,
          grid: {
            stroke: () => this.ctrl.getTheme().yAxis.gridStroke,
          },
          ticks: {
            stroke: () => this.ctrl.getTheme().yAxis.tickStroke,
          },
          border: {
            stroke: () => this.ctrl.getTheme().xAxis.tickStroke,
          },
        },
      ],
    };
  }

  getUPlotChart() {
    return this.uPlot;
  }

  private getPlugins() {
    return [this.getTooltipPlugin()];
  }

  private getTooltipPlugin() {
    let over: HTMLDivElement;
    let bound: HTMLDivElement;
    // let bLeft: number;
    // let bTop: number;
    let cacheData: { title: string | number; values: Data };
    let overBbox: DOMRect;
    return {
      hooks: {
        init: (u: UPlot) => {
          over = u.over;
          bound = over;
          const cursorX = u.over.querySelector('.u-cursor-x') as HTMLElement;
          if (cursorX) {
            cursorX.style.visibility = 'hidden';
          }
          over.addEventListener('click', () => {
            const { left } = u.cursor;
            const data = this.ctrl.getData();
            const x = u.data[0][u.valToIdx(u.posToVal(left, 'x'))];
            const values = data.reduce((pre, cur) => {
              const items = cur.values.find(c => c.x === x);
              const values = { ...items, ...omit(cur, 'values') };
              return [...pre, values];
            }, []);
            this.ctrl.emit(ChartEvent.PLOT_CLICK, {
              title: x,
              values,
            });
          });
          over.addEventListener('mouseenter', () => {
            if (u.series.some(d => d.scale === 'y' && d.show)) {
              this.ctrl.emit(ChartEvent.PLOT_MOUSEMOVE);
              const noData = !u.data[1].some(d => d !== null);
              if (!noData && !this.ctrl.hideTooltip && !this.isElementAction) {
                (this.ctrl.components.get('tooltip') as Tooltip).showTooltip();
              }
            }
          });
          over.addEventListener('mouseleave', () => {
            this.ctrl.emit(ChartEvent.PLOT_MOUSELEAVE);
            (this.ctrl.components.get('tooltip') as Tooltip).hideTooltip();
          });
        },
        syncRect: (_: uPlot, rect: DOMRect) => (overBbox = rect),
        setCursor: (u: uPlot) => {
          if (!overBbox) {
            return;
          }
          const { left, top, idx, idxs } = u.cursor;
          const x = u.data[0][idx];
          // const bbox = u.over.getBoundingClientRect();
          // bLeft = bbox.left;
          // bTop = bbox.top;
          // const anchor = {
          //   left: left + bbox.left,
          //   top: top + bbox.top,
          // };
          // const { x: tX, y } = positionTooltip(u, overBbox || bbox);
          // const anchor = {
          //   left: tX,
          //   top: y,
          // };
          // console.log(anchor,scrollY ,bbox.top, );
          const data = this.ctrl.getData();

          const ySeries = u.series.filter(d => d.scale === 'y');

          const values = data.reduce((prev, curr, index) => {
            const allow = this.isElementAction ? idxs[index + 1] : true;
            return ySeries[index]?.show && allow
              ? [
                  ...prev,
                  {
                    name: curr.name,
                    color: curr.color,
                    value: curr.values[idx || 0]?.y,
                    activated: this.activeId === index + 1,
                    ...curr.values[idx || 0],
                  },
                ]
              : prev;
          }, []);
          const cursorX = u.over.querySelector('.u-cursor-x') as HTMLElement;
          const cursorY = u.over.querySelector('.u-cursor-y') as HTMLElement;
          const noData = !values.some(d => d.y !== null);
          const visibility = noData ? 'hidden' : 'visible';
          const visibilityX =
            noData || this.ctrl.hideTooltip ? 'hidden' : 'visible';

          if (cursorX) {
            cursorX.style.visibility = visibilityX;
          }
          if (cursorY) {
            cursorY.style.visibility = visibility;
          }

          if (noData && !this.isElementAction) {
            return;
          }

          if (!this.isElementAction) {
            cacheData = {
              title: x,
              values,
            };
          }

          if (idxs.some(Boolean)) {
            cacheData = {
              title: x,
              values,
            };
            if (!this.recordActive) {
              this.recordActive = true;
              this.ctrl.emit(ChartEvent.ELEMENT_MOUSEMOVE);
              if (!noData && !this.ctrl.hideTooltip) {
                (this.ctrl.components.get('tooltip') as Tooltip).showTooltip();
              }
            }
          } else {
            if (this.recordActive) {
              this.ctrl.emit(ChartEvent.ELEMENT_MOUSELEAVE);
              this.recordActive = false;
              (this.ctrl.components.get('tooltip') as Tooltip).hideTooltip();
            }
          }

          if (cacheData && this.cursor) {
            this.cursor.style.transform = `translate(${left}px,${top}px)`;
            this.ctrl.emit(ChartEvent.U_PLOT_SET_CURSOR, {
              bound,
              anchor: this.cursor || u.over.querySelector('.u-cursor-x'),
              title: cacheData.title,
              values: cacheData.values,
            });
            // this.ctrl.emit(ChartEvent.U_PLOT_SET_CURSOR, {
            //   bound,
            //   anchor,
            //   title: cacheData.title,
            //   values: cacheData.values,
            // });
          }
        },
        setSelect: [
          (u: uPlot) => {
            if (u.select.width) {
              const start =
                u.data[0][u.valToIdx(u.posToVal(u.select.left, 'x'))];
              const end =
                u.data[0][
                  u.valToIdx(u.posToVal(u.select.left + u.select.width, 'x'))
                ];
              // manually hide selected region (since cursor.drag.setScale = false)
              /* @ts-ignore */
              u.setSelect({ left: 0, width: 0 }, false);
              this.ctrl.emit(ChartEvent.PLOT_MOUSEUP, { start, end });
            }
          },
        ],
      },
    };
  }

  public override destroy(): void {
    this.components = [];
    this.uPlot?.destroy();
  }
}

function isCursorOutsideCanvas({ left, top }: uPlot.Cursor, canvas: DOMRect) {
  if (left === undefined || top === undefined) {
    return false;
  }
  return left < 0 || left > canvas.width || top < 0 || top > canvas.height;
}

/**
 * Finds y axis midpoint for point at given idx (css pixels relative to uPlot canvas)
 * @internal
 **/

export function findMidPointYPosition(u: uPlot, idx: number) {
  let y;
  let sMaxIdx = 1;
  let sMinIdx = 1;
  // assume min/max being values of 1st series
  let max = u.data[1][idx];
  let min = u.data[1][idx];

  // find min max values AND ids of the corresponding series to get the scales
  for (let i = 1; i < u.data.length; i++) {
    const sData = u.data[i];
    const sVal = sData[idx];
    if (sVal != null) {
      if (max == null) {
        max = sVal;
      } else {
        if (sVal > max) {
          max = u.data[i][idx];
          sMaxIdx = i;
        }
      }
      if (min == null) {
        min = sVal;
      } else {
        if (sVal < min) {
          min = u.data[i][idx];
          sMinIdx = i;
        }
      }
    }
  }

  if (min == null && max == null) {
    // no tooltip to show
    y = undefined;
  } else if (min != null && max != null) {
    // find median position
    y =
      (u.valToPos(min, u.series[sMinIdx].scale!) +
        u.valToPos(max, u.series[sMaxIdx].scale!)) /
      2;
  } else {
    // snap tooltip to min OR max point, one of those is not null :)
    y = u.valToPos((min || max)!, u.series[(sMaxIdx || sMinIdx)!].scale!);
  }

  // if y is out of canvas bounds, snap it to the bottom
  if (y !== undefined && y < 0) {
    y = u.bbox.height / devicePixelRatio;
  }

  return y;
}

/**
 * Given uPlot cursor position, figure out position of the tooltip withing the canvas bbox
 * Tooltip is positioned relatively to a viewport
 * @internal
 **/
export function positionTooltip(u: uPlot, bbox: DOMRect) {
  let x, y;
  const cL = u.cursor.left || 0;
  const cT = u.cursor.top || 0;

  if (isCursorOutsideCanvas(u.cursor, bbox)) {
    const idx = u.posToIdx(cL);
    // when cursor outside of uPlot's canvas
    if (cT < 0 || cT > bbox.height) {
      let pos = findMidPointYPosition(u, idx);

      if (pos) {
        y = bbox.top + pos;
        if (cL >= 0 && cL <= bbox.width) {
          // find x-scale position for a current cursor left position
          x =
            bbox.left +
            u.valToPos(u.data[0][u.posToIdx(cL)], u.series[0].scale!);
        }
      }
    }
  } else {
    x = bbox.left + cL;
    y = bbox.top + cT;
  }

  return { x, y };
}
