import { View } from '../chart/index.js';

import { ServiceController } from './service-controller.js';
import { UIController } from './ui-controller.js';

export type ControllerCtor<T = any> = new (view: View) =>
  | UIController<T>
  | ServiceController<T>;

export abstract class Controller<T = unknown> {
  constructor(public owner: View) {}

  protected option!: T;

  abstract get name(): string;

  abstract init(): void;

  abstract destroy?(): void;
}
