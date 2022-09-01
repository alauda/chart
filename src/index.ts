/// <reference types="typed-query-selector/strict.js" />

import { ComponentService } from './components/index.js';
import { Title } from './components/title.js';

export const Component = new ComponentService();

export * from './chart/index.js';
export * from './types/index.js';
export * from './utils/index.js';

// register component
Component.registerComponent('title', Title);
