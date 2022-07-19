import { View } from '../chart';

import { ServiceController } from './service-controller';
import { UIController } from './ui-controller';

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
