import { getComponent, getComponentNames } from '../components/index.js';
import { generateElName, ViewOption } from '../index.js';

import { BBox } from './bbox.js';

export class View extends HTMLElement {
  bbox: BBox;

  // 全局配置的组件
  private readonly usedComponent: string[] = getComponentNames();

  /** 所有的组件 controllers。 */
  components: CustomElementConstructor[] = [];

  get name() {
    return generateElName('view');
  }

  init(option: ViewOption) {
    this.initComponent();
    const { width, height, svgEl } = option;
    this.bbox = new BBox({
      container: svgEl,
      width,
      height,
    });
  }

  render() {
    console.log('render');
  }

  interaction(name?: string) {
    console.log(name);
    // createInteraction..
  }

  /**
   * 基于注册组件初始化
   */
  private initComponent() {
    const usedComponent = this.usedComponent;
    for (let i = 0, len = usedComponent.length; i < len; i++) {
      const name = usedComponent[i];
      const Component = getComponent(name);
      if (Component) {
        const customElName = generateElName(name);
        customElements.define(customElName, Component);
        this.components.push(customElements.get(customElName));
      }
    }
  }

  disconnectedCallback() {
    // ..
  }
}

customElements.define(generateElName('view'), View);
