import View from '../chart/view';

import { ServiceController } from './service-controller';
import { UIController } from './ui-controller';

export type ControllerCtor<T = any> = new (view: View) =>
  | UIController<T>
  | ServiceController<T>;

export abstract class Controller<T = unknown> {
  owner!: View;

  constructor(owner: View) {
    this.owner = owner;
  }

  protected option!: T;

  public abstract get name(): string;

  public abstract init(): void;

  public abstract destroy?(): void;
}
