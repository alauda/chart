import { noop } from 'lodash';

import { TooltipStrategy } from './strategy.js';

export class NoneTooltipStrategy extends TooltipStrategy {
  registerPaths = noop;
}
