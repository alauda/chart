import { Controller } from './controller';

export abstract class UIController<T = unknown> extends Controller<T> {
  abstract render(): void;
}
