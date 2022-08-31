/// <reference types="typed-query-selector/strict.js" />

import { registerComponent } from './components/index.js';
import { Title } from './components/title.js';

export * from './chart/index.js';
export * from './types/index.js';
export * from './utils/index.js';

// register component
registerComponent('title', Title);
