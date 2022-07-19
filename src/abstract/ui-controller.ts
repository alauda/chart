import { Controller } from './controller.js';

export abstract class UIController<T = unknown> extends Controller<T> {
  abstract render(): void;
}
