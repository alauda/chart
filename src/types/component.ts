export interface LegendItemActive {
  name: string;
  activated: boolean;
}

interface Coordinates {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export type Placement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'left'
  | 'left-start'
  | 'left-end';

export interface TooltipItemActive {
  anchor: Element | Range | Coordinates;
  bound: Element | Range | Coordinates;
  title: string;
  position?: Placement;
  values: TooltipValue[];
}

export interface TooltipValue {
  name: string;
  color: string;
  value: number;
  activated?: boolean;
}
