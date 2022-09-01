export class ComponentService {
  private readonly LOADED_COMPONENTS: Map<string, CustomElementConstructor> =
    new Map();

  /**
   * 全局注册组件。
   * @param name 组件名称
   * @param plugin 注册的组件类
   * @returns void
   */
  registerComponent(name: string, plugin: CustomElementConstructor) {
    this.LOADED_COMPONENTS.set(name, plugin);
  }

  /**
   * 删除全局组件。
   * @param name 组件名
   * @returns void
   */
  unregisterComponent(name: string) {
    this.LOADED_COMPONENTS.delete(name);
  }

  /**
   * 获取以注册的组件名。
   * @returns string[] 返回已注册的组件名称
   */
  getComponentNames(): string[] {
    return [...this.LOADED_COMPONENTS.keys()];
  }

  /**
   * 根据组件名获取组件类。
   * @param name 组件名
   * @returns 返回组件类
   */
  getComponent(name: string): CustomElementConstructor {
    return this.LOADED_COMPONENTS.get(name);
  }
}
