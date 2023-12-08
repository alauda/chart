import { ValueOf } from '../index.js';

export const ShapeType = {
  Line: 'line',
  Area: 'area',
  Bar: 'bar',
  Point: 'point',
} as const;

export type ShapeType = ValueOf<typeof ShapeType>;

export const SHAPE_TYPES = Object.values(ShapeType);

export const PolarShapeType = {
  Pie: 'pie',
  Gauge: 'gauge',
};
export type PolarShapeType = ValueOf<typeof PolarShapeType>;

export const POLAR_SHAPE_TYPES = Object.values(PolarShapeType);
