import { flow } from 'lodash';

export const formatPercent = (n: number) =>
  n.toLocaleString('en-US', { style: 'percent' });

export const formatFixedWithUnit = (unit: string) => (n: number) =>
  `${n.toFixed(2)}${unit}`;

export const divideBy = (by: number) => (n: number) => n / by;

export const defaultFormat = (value: number | string | undefined) =>
  value !== undefined ? String(value) : 'N/A';

export const formatMillisecondsAsSeconds = flow(
  divideBy(1000),
  formatFixedWithUnit('s'),
);

export const formatBytesAsKibibytes = flow(
  divideBy(1024),
  formatFixedWithUnit('KiB'),
);

export const formatHasPassed = (hasPassed?: boolean) =>
  hasPassed === true
    ? 'Passed :heavy_check_mark:'
    : hasPassed === false ? 'Failed ❌' : defaultFormat(undefined);

export const formatYesOrNo = (result?: boolean | null) =>
  result === true
    ? 'Yes :heavy_check_mark:'
    : result === false ? 'No ❌' : defaultFormat(undefined);
