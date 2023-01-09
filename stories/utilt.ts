export function dealWithTime(date: Date) {
  const Y = date.getFullYear();
  const M =
    date.getMonth() + 1 - 0 >= 10
      ? Number(date.getMonth()) + 1
      : '0' + (Number(date.getMonth()) + 1);
  const D = date.getDate();
  const h = date.getHours() >= 10 ? date.getHours() : '0' + date.getHours();
  const m =
    date.getMinutes() >= 10 ? date.getMinutes() : '0' + date.getMinutes();
  const s =
    date.getSeconds() >= 10 ? date.getSeconds() : '0' + date.getSeconds();
  return Y + '-' + M + '-' + D + ' ' + h + ':' + m + ':' + s;
}

export function generateData(
  start: string,
  num: number,
  step: number,
  range: [number, number] = [10, 20],
) {
  const s = new Date(start).valueOf() / 1000;
  const [max, min] = range;

  return Array.from({ length: num + 1 })
    .fill(0)
    .map((_, i) => {
      const x: number = i ? s + i * step : s;
      const v = Math.random() * (max + 1 - min) + min;
      return {
        x,
        y: v,
        xx: dealWithTime(new Date(x * 1000)),
      };
    });
}

export function generateTime(start: string, num: number, step: number) {
  const s = new Date(start).valueOf() / 1000;
  return Array.from({ length: num + 1 })
    .fill(0)
    .map((_, i) => {
      const x: number = i ? s + i * step : s;
      return x;
    });
}

export function generateY(num: number, range: [number, number] = [10, 20]) {
  return Array.from({ length: num + 1 })
    .fill(0)
    .map(() => getRandom(range));
}

export function getRandom(range: [number, number] = [10, 20]) {
  const [max, min] = range;
  return +(Math.random() * (max + 1 - min) + min).toFixed(2);
}
