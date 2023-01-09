import { registerComponent } from './components/index.js';
import { Legend } from './components/legend.js';
import { Title } from './components/title.js';
import { Tooltip } from './components/tooltip.js';
import { Dark, registerTheme } from './theme/index.js';

export * from './chart/index.js';
export * from './types/index.js';
export * from './utils/index.js';

// register component
registerComponent('title', Title);

registerComponent('legend', Legend);

registerComponent('tooltip', Tooltip);

// 注册黑暗主题
registerTheme('dark', Dark());
