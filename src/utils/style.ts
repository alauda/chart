export function rgbColor(color: string): string {
    return `rgb(var(--ac-color-${color}))`;
}

export function rgbaColor([color, opacity]: [string, number]) {
    return `rgba(var(--ac-color-${color}), ${opacity})`;
}

export function cssVar(value: string) {
    return `var(--ac-${value})`;
}
