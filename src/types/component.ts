export interface LegendItemActive {
  index: number;
  data: { name: string; color: string };
  isActive: boolean;
}

interface Coordinates {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export interface TooltipItemActive {
  anchor: Element | Range | Coordinates;
  bound: Element | Range | Coordinates;
  title: string;
  values: TooltipValue[];
}

export interface TooltipValue {
  name: string;
  color: string;
  value: number;
}
