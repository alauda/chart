import { noop } from 'lodash';

import { TooltipStrategy } from './strategy';

export class NoneTooltipStrategy extends TooltipStrategy {
  registerPaths = noop;
}
