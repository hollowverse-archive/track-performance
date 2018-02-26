export const formatPercent = (n: number) =>
  n.toLocaleString('en-US', { style: 'percent' });

export const formatFixedWithUnit = (unit: string) => (n: number) =>
  `${n.toFixed(2)}${unit}`;

export const divideBy = (by: number) => (n: number) => n / by;

export const defaultFormat = (value: number | string | undefined) =>
  value !== undefined ? String(value) : 'N/A';
