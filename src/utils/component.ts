import { ValueOf } from '../index.js';

export const ShapeType = {
  Line: 'line',
  Area: 'area',
  Bar: 'bar',
  Point: 'point',
} as const;

export type ShapeType = ValueOf<typeof ShapeType>;

export const SHAPE_TYPES = Object.values(ShapeType);
