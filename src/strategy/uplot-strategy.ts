import { merge } from 'lodash';
import UPlot from 'uplot';

import { Data, LegendItemActive, ShapeOption, Size } from '../types/index.js';
import { CHART_EVENTS } from '../utils/constant.js';
import { getChartColor } from '../utils/index.js';

import { ViewStrategy } from './abstract.js';
import { UPLOT_DEFAULT_OPTIONS } from './config.js';

/**
 * 渲染策略
 * uPlot 渲染图表
 */
export class UPlotViewStrategy extends ViewStrategy {
  get name(): string {
    return 'uPlot';
  }

  get component(): string[] {
    return ['axis', 'tooltip', 'line', 'area', 'bar', 'point'];
  }

  private uPlot: uPlot;

  init() {
    // ..
    this.getChartEvent();
  }

  /**
   * 监听 chart 事件
   */
  getChartEvent() {
    // 监听 主题改变
    this.ctrl.on(CHART_EVENTS.THEME_CHANGE, () => {
      if (this.uPlot) {
        this.uPlot.redraw();
      }
    });

    // 监听 legend item click
    this.ctrl.on(CHART_EVENTS.LEGEND_ITEM_CLICK, (data: LegendItemActive) => {
      if (this.uPlot) {
        this.uPlot.setSeries(data.index + 1, { show: !data.isActive }, true);
      }
    });

    this.ctrl.on(CHART_EVENTS.DATA_CHANGE, () => {
      if (this.uPlot) {
        const data = this.getData();
        this.uPlot.setData(data);
        if (this.uPlot.series.length < data.length) {
          this.getSeries(this.ctrl.getData()).forEach((s, index) => {
            if (index) {
              this.uPlot.addSeries(s, index);
            }
          });
        }
        const legend = this.ctrl.components.get('legend');
        legend.update();
      }
    });
  }

  render(size?: Size) {
    const option = this.getOption();
    const data = this.getData();
    if (!this.uPlot) {
      this.uPlot = new UPlot(option, data, this.ctrl.container);
    }
    this.changeSize(size || this.ctrl.size);
    console.timeEnd('render');
  }

  /**
   * 修改 uPlot 视图大小
   * @param size 宽 高
   */
  private changeSize(size: Size) {
    this.uPlot.setSize(size);
    if (this.ctrl.getData().length) {
      this.uPlot.redraw(false);
    }
  }

  /**
   * 获取 uPlot 配置
   * 将原始 option 转换 uPlot 配置
   */
  private readonly getOption = (): uPlot.Options => {
    const { width, height } = this.ctrl.size;
    const series = this.getSeries(this.ctrl.getData());
    const theme = this.getThemeOption();
    const plugins = this.getPlugins();
    return merge(
      {
        width,
        height,
        ...UPLOT_DEFAULT_OPTIONS,
        series,
        plugins,
        fmtDate: () => UPlot.fmtDate('{HH}:{mm}'),
        hooks: {
          ready: [
            () => {
              this.ctrl.emit(CHART_EVENTS.U_PLOT_READY);
            },
          ],
        },
      },
      theme,
    );
  };

  /**
   * 获取数据
   * 原始数据转换为 uPlot 数据
   * @returns uPlot.AlignedData
   */
  private getData(): uPlot.AlignedData {
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
  getSeries(data: Data) {
    const shape = this.ctrl.getOption().shape;
    let defaultType = 'line';
    let shapes: ShapeOption[];
    if (shape) {
      shapes = Object.values(shape);
      defaultType = Object.keys(shape)[0] || 'line';
    }
    return [
      {},
      ...data.map(({ color, name }, index) => {
        const c: string = color || getChartColor(index);
        const type = shapes?.find(d => d.name === name)?.type || defaultType;
        return {
          stroke: c,
          label: name,
          points: {
            show: false,
          },
          ...this.getSeriesPathType(type, c),
        };
      }),
    ];
  }

  getSeriesPathType(type: string, color: string) {
    const defaultType = UPlot.paths.spline();
    return (
      {
        line: {
          paths: defaultType,
        },
        area: {
          paths: defaultType,
          alpha: 0.6,
          width: 1.5,
          // fill: color,
          fill: (u: UPlot, seriesIdx: number) => {
            const s = u.series[seriesIdx];
            return this.scaleGradient(u, s.scale, 1, [
              [0, color],
              [100, color],
            ]);
          },
        },
        bar: {
          paths: UPlot.paths.bars(),
          fill: color,
        },
        point: {
          paths: UPlot.paths.points(),
        },
      }[type] || {
        paths: defaultType,
      }
    );
  }

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
        },
        {
          stroke: () => this.ctrl.getTheme().yAxis.stroke,
          grid: {
            stroke: () => this.ctrl.getTheme().yAxis.gridStroke,
          },
          ticks: {
            stroke: () => this.ctrl.getTheme().yAxis.tickStroke,
          },
        },
      ],
    };
  }

  getPlugins() {
    return [this.getTooltipPlugin()];
  }

  getTooltipPlugin() {
    let over: HTMLDivElement;
    let bound: HTMLDivElement;
    let bLeft: number;
    let bTop: number;
    return {
      hooks: {
        init: (u: UPlot) => {
          over = u.over;
          bound = over;
          over.addEventListener('mouseenter', () => {
            if (u.series.some(d => d.scale === 'y' && d.show)) {
              this.ctrl.emit(CHART_EVENTS.U_PLOT_OVER_MOUSEENTER);
            }
          });
          over.addEventListener('mouseleave', () => {
            this.ctrl.emit(CHART_EVENTS.U_PLOT_OVER_MOUSELEAVE);
          });
        },
        setSize: () => {
          const bbox = over.getBoundingClientRect();
          bLeft = bbox.left;
          bTop = bbox.top;
        },
        setCursor: (u: uPlot) => {
          const { left, top, idx } = u.cursor;
          const x = u.data[0][idx];
          const anchor = { left: left + bLeft, top: top + bTop };
          const data = this.ctrl.getData();

          const ySeries = u.series.filter(d => d.scale === 'y');
          const values = data.reduce((prev, curr, index) => {
            return ySeries[index]?.show
              ? [
                  ...prev,
                  {
                    name: curr.name,
                    color: curr.color || getChartColor(index),
                    value: curr.values[idx || 0].y,
                  },
                ]
              : prev;
          }, []);

          this.ctrl.emit(CHART_EVENTS.U_PLOT_SET_CURSOR, {
            bound,
            anchor,
            title: x,
            values,
          });
        },
      },
    };
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  scaleGradient(
    u: UPlot,
    scaleKey: string,
    ori: number,
    scaleStops: Array<[number, string]>,
    discrete = false,
  ) {
    const can = document.createElement('canvas');
    const ctx = can.getContext('2d');
    const scale = u.scales[scaleKey];

    // we want the stop below or at the scaleMax
    // and the stop below or at the scaleMin, else the stop above scaleMin
    let minStopIdx: number;
    let maxStopIdx: number;

    for (const [i, scaleStop] of scaleStops.entries()) {
      const stopVal = scaleStop[0];

      if (stopVal <= scale.min || minStopIdx == null) minStopIdx = i;

      maxStopIdx = i;

      if (stopVal >= scale.max) break;
    }

    if (minStopIdx === maxStopIdx) return scaleStops[minStopIdx][1];

    let minStopVal = scaleStops[minStopIdx][0];
    let maxStopVal = scaleStops[maxStopIdx][0];

    if (minStopVal === -Infinity) minStopVal = scale.min;

    if (maxStopVal === Infinity) maxStopVal = scale.max;

    const minStopPos = u.valToPos(minStopVal, scaleKey, true);
    const maxStopPos = u.valToPos(maxStopVal, scaleKey, true);

    const range = minStopPos - maxStopPos;

    let x0: number, y0: number, x1: number, y1: number;

    if (ori === 1) {
      x0 = x1 = 0;
      y0 = minStopPos;
      y1 = maxStopPos;
    } else {
      y0 = y1 = 0;
      x0 = minStopPos;
      x1 = maxStopPos;
    }

    const grd = ctx.createLinearGradient(x0, y0, x1, y1);
    let prevColor: string;

    for (let i = minStopIdx; i <= maxStopIdx; i++) {
      const s = scaleStops[i];

      const stopPos =
        i === minStopIdx
          ? minStopPos
          : i === maxStopIdx
          ? maxStopPos
          : u.valToPos(s[0], scaleKey, true);
      const pct = (minStopPos - stopPos) / range;

      if (discrete && i > minStopIdx) grd.addColorStop(pct, prevColor);

      grd.addColorStop(pct, (prevColor = s[1]));
    }

    return grd;
  }
}
