import { isObject } from 'lodash';
import { getComponent, getComponentNames } from '../components/index.js';
import {
  generateElName,
  Options,
  Theme,
  ThemeOptions,
  ViewOption,
} from '../index.js';
import { getTheme } from '../theme/index.js';

export class View {
  // 全局配置的组件
  private readonly usedComponent: string[] = getComponentNames();

  /** 所有的组件 controllers。 */
  components: CustomElementConstructor[] = [];

  // 配置信息存储
  protected options: Options = {};

  /** 主题配置，存储当前主题配置。 */
  protected themeObject: ThemeOptions;

  constructor(props: ViewOption) {
    const { options } = props;
    this.options = options;
    this.init();
  }

  init() {
    this.initComponent();
  }

  render() {
    console.log('render');
  }

  interaction(name?: string) {
    name;
    // createInteraction..
  }

  /**
   * 基于注册组件初始化
   */
  private initComponent() {
    const usedComponent = this.usedComponent;
    for (let i = 0, len = usedComponent.length; i < len; i++) {
      const name = usedComponent[i];
      const component = getComponent(name);
      if (component) {
        const customElName = generateElName(name);
        customElements.define(customElName, component);
        this.components.push(customElements.get(customElName));
      }
    }
  }

  /**
   * 设置主题。
   * @param theme 主题名或者主题配置
   * @returns View
   */
  public theme(theme?: string | Theme): View {
    this.themeObject = isObject(theme) ? getTheme(theme.type, theme): getTheme(theme);
    return this;
  }

  /**
   * 获取主题配置。
   * @returns themeObject
   */
  public getTheme(): ThemeOptions {
    return this.themeObject;
  }

  /**
   * 生命周期：销毁，完全无法使用。
   */
  public destroy() {
    // ...
  }
}
