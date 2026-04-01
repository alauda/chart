import { DEFAULT_COLORS } from "../utils/constant.js";

export class ChartColorManager {
  private colorMap = new Map<string, string>();

  getChartColor(key?: string) {
    if (!key) return DEFAULT_COLORS[0];

    if (this.colorMap.has(key)) {
      return this.colorMap.get(key)!;
    }

    const color = DEFAULT_COLORS[this.colorMap.size % DEFAULT_COLORS.length];
    this.colorMap.set(key, color);
    return color;
  }

  cleanupChartColors(validKeys: string[]) {
    const currentKeys = new Set(validKeys);
    for (const key of this.colorMap.keys()) {
      if (!currentKeys.has(key)) {
        this.colorMap.delete(key);
      }
    }
  }

  reset() {
    this.colorMap.clear();
  }
}