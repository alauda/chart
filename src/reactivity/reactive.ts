import { isObjectLike, merge } from 'lodash';
import onChange, { ApplyData } from 'on-change';
import { View } from '../chart/view.js';
import { Data } from '../types/index.js';

interface ReactiveContext {
  path: string;
  value: unknown;
  previousValue: unknown;
  applyData: ApplyData;
}

export class Reactive {
  source: object;
  reactiveObject: object;
  dep: Dep;
  constructor(target: object, chart: View) {
    this.dep = new Dep(chart);
    this.source = target;
    this.createReactiveObject(this.source);
  }

  createReactiveObject(target: object) {
    this.reactiveObject = onChange(
      target,
      (
        path: string,
        value: unknown,
        previousValue: unknown,
        applyData: ApplyData,
      ) => {
        this.dep.notify({ path, value, previousValue, applyData });
      },
    );
    return this.reactiveObject;
  }

  unsubscribe() {
    onChange?.unsubscribe(this.createReactiveObject);
  }
}

export function reactive(source: object, chart: View): Reactive {
  return new Reactive(source, chart);
}

export class Dep {
  ctrl: View;
  constructor(chart: View) {
    this.ctrl = chart;
  }

  notify({ path, value, previousValue }: ReactiveContext) {
    // console.log(path, value, previousValue, applyData);
    const names = path.split('.');
    this.syncConfig(names, value, previousValue);
    this.update(names, value);
  }

  /**
   * 同步 chart option config
   */
  private syncConfig(names: string[], value: unknown, previousValue: unknown) {
    let option = value;
    if (isObjectLike(value)) {
      option = merge(previousValue, value);
    }
    // TODO: isArray?
    const [str, ...name] = names;
    this.ctrl.setOption(str === 'options' ? name : names, option);
  }

  private update(names: string[], value: unknown) {
    if (names.includes('data') && names.length === 1) {
      this.ctrl.data(value as Data);
    }
    if (names.includes('options') && names.length > 1) {
      const [_, componentName] = names;
      const component = this.ctrl.components.get(componentName);
      component?.update();
    }
  }
}
