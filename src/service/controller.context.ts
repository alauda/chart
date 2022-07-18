import { ControllerCtor } from '../abstract';

export class ControllerContextService {
  private readonly LOADED_COMPONENTS: Set<ControllerCtor> = new Set();

  registerComponent(ctl: ControllerCtor) {
    this.LOADED_COMPONENTS.add(ctl);
  }

  unregisterComponent(ctl: ControllerCtor) {
    this.LOADED_COMPONENTS.delete(ctl);
  }

  getComponents() {
    return Array.from(this.LOADED_COMPONENTS);
  }
}
