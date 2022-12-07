import {
  ChartOption,
  getChartSize,
  getElement,
  resizeObserver,
  Size,
  Theme,
} from '../index.js';
import { Dark, Light } from '../theme/index.js';
import { DEFAULT_INTERACTIONS } from '../utils/constant.js';
import { View } from './view.js';

export class Chart extends View {
  public ele: HTMLElement;
  public width: number;
  public height: number;

  private sizeObserver: ResizeObserver;

  private mediaQuery: MediaQueryList;

  constructor(props: ChartOption) {
    const {
      container,
      width,
      height,
      theme,
      defaultInteractions = DEFAULT_INTERACTIONS,
      options,
    } = props;
    const ele: HTMLElement = getElement(container);
    super({
      ele,
      options,
    });
    const size = getChartSize(ele, width, height);
    this.ele = ele;
    this.width = size.width;
    this.height = size.height;
    this.initDefaultInteractions(defaultInteractions);
    this.initTheme(theme);
    this.bindAutoFit();
  }

  private initDefaultInteractions(interactions: string[]) {
    for (const interaction of interactions) {
      this.interaction(interaction);
    }
  }

  /**
   * 
   * @param theme 主题
   * 不设置默认根据系统切换 light dark
   */
  private initTheme(theme: Theme) {
    if (!theme || theme?.type === 'system') {
      this.bindThemeListener()
    }
    this.theme(theme);
  }

  private systemChangeTheme(e: MediaQueryListEvent) {
    if(e.matches){
      this.theme(e.matches ? Dark() : Light())
    }
  }

  private bindThemeListener () {
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener('change', this.systemChangeTheme);
  }

  private unbindThemeListener () {
    this.mediaQuery.removeEventListener('change', this.systemChangeTheme);
  }

  private bindAutoFit() {
    this.sizeObserver = resizeObserver(this.ele, this.changeSize);
  }

  private unbindAutoFit() {
    this.sizeObserver.disconnect();
  }

  /**
   * 改变图表大小，重新渲染 （由 bbox内部处理）
   * @param width
   * @param height
   * @returns Chart
   */
  public changeSize = ({ width, height }: Size) => {
    if (this.width === width && this.height === height) {
      return;
    }
    this.width = width;
    this.height = height;
    // this.bbox.changeSize(width, height);
    // 重新渲染
    this.render();
    return this;
  };

  /**
   * 销毁图表
   */
  public override destroy() {
    super.destroy();
    this.unbindAutoFit();
    this.unbindThemeListener();
    this.ele = null;
  }
}
