import { Controller } from './controller.js';

export abstract class ServiceController<T = unknown> extends Controller<T> {}
