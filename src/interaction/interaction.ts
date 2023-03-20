import { each } from 'lodash';

import { View } from '../chart/view.js';
import {
  ActionObject,
  InteractionStep,
  InteractionSteps,
} from '../types/index.js';

import { getAction } from './action/index.js';

export type InteractionCtor = new (view: View, opt: unknown) => Interaction;

// 执行 Action
function executeAction(actionObject: ActionObject, context?: any) {
  const action = actionObject.action as any;
  const { methodName } = actionObject;
  if (action?.[methodName]) {
    action[methodName](context);
  } else {
    throw new Error(
      `Action(${
        action.name as string
      }) doesn't have a method called ${methodName}`,
    );
  }
}

/**
 * 交互的基类。
 */
export default class Interaction {
  /** view 或者 chart */
  protected view: View;
  /** 配置项 */
  steps: InteractionSteps;

  private readonly callbackCaches: Map<string, (context?: any) => void> =
    new Map();

  constructor(view: View, steps: InteractionSteps) {
    this.view = view;
    this.steps = steps;
  }

  /**
   * 初始化。
   */
  init() {
    this.initActionObject();
    this.initEvents();
  }

  /**
   * 绑定事件
   */
  protected initEvents() {
    // TODO: point 下 tooltip trigger 为 element
    const point = this.view.shapeComponents.get('point');
    each(this.steps, (value: InteractionStep[], stepName) => {
      value.forEach(step => {
        const callback = this.getActionCallback(stepName, step);
        const isPlot = step.trigger.includes('plot');
        this.view.on(
          point && isPlot
            ? step.trigger.replace('plot', 'element')
            : step.trigger,
          callback,
        );
      });
    });
  }

  // 初始化 action object
  private initActionObject() {
    const steps = this.steps;
    // 生成具体的 Action
    each(steps, subSteps => {
      each(subSteps, step => {
        step.actionObject = this.getActionObject(step.action);
      });
    });
  }

  private getActionCallback(
    stepName: string,
    step: InteractionStep,
  ): (e: object) => void {
    const callbackCaches = this.callbackCaches;
    if (step.action) {
      const key = stepName;
      if (!callbackCaches.get(key)) {
        // 生成执行的方法，执行对应 action 的名称
        const actionCallback = (context: any) => {
          executeAction(step.actionObject, context);
          step.callback?.(context); // 执行callback
        };
        callbackCaches.set(stepName, actionCallback);
      }
      return callbackCaches.get(stepName);
    }
    return null;
  }

  private getActionObject = (actionStr: string): ActionObject => {
    const [actionName, methodName] = actionStr.split(':');
    const Action = getAction(actionName);
    if (!Action) {
      throw new Error(`There is no action named ${actionName}`);
    }
    return {
      action: new Action(this.view),
      methodName,
    };
  };

  /**
   * 销毁事件
   */
  protected clearEvents() {
    const point = this.view.shapeComponents.get('point');
    each(this.steps, (value: InteractionStep[]) => {
      value.forEach(step => {
        const isPlot = step.trigger.includes('plot');
        this.view.off(
          point && isPlot
            ? step.trigger.replace('plot', 'element')
            : step.trigger,
        );
      });
    });
  }

  /**
   * 销毁。
   */
  destroy() {
    this.clearEvents();
  }
}
