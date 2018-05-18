import {
  TestResults,
  RunTestResponse,
  Response,
  SuccessResponse,
} from 'webpagetest';

export const isSuccessfulResponse = <D = any>(
  response: Response<D>,
): response is SuccessResponse<D> => {
  return response.statusCode === 200 || response.statusCode === 201;
};

export const hasLighthouseData = (
  response: SuccessResponse<TestResults.BaseTestResults<any>>,
): response is SuccessResponse<
  TestResults.BaseTestResults<TestResults.LighthouseResults>
> => {
  return 'lighthouse.Performance' in response.data.average.firstView;
};

export const isWaitUntilTestCompleteResponse = <T = any>(
  response: RunTestResponse<T>,
): response is Response<TestResults.BaseTestResults<T>> => {
  return (
    (response as any).data !== undefined &&
    !('testId' in (response as any).data)
  );
};

export const lighthouseKeyToNameAndUnit: Record<
  keyof TestResults.LighthouseResults,
  { name: string; unit: 'percent' | 'ms' | 'none' }
> = {
  'lighthouse.Performance': { name: 'Performance', unit: 'percent' },
  'lighthouse.Performance.first-meaningful-paint': {
    name: 'First Meaningful Paint',
    unit: 'ms',
  },
  'lighthouse.Performance.first-interactive': {
    name: 'First Interactive',
    unit: 'ms',
  },
  'lighthouse.Performance.consistently-interactive': {
    name: 'Consistently Interactive',
    unit: 'ms',
  },
  'lighthouse.Performance.speed-index-metric': {
    name: 'Speed Index Metric',
    unit: 'none',
  },
  'lighthouse.Performance.estimated-input-latency': {
    name: 'Estimated Input Latency',
    unit: 'ms',
  },
  'lighthouse.ProgressiveWebApp': { name: 'PWA', unit: 'percent' },
  'lighthouse.Accessibility': { name: 'Accessibility', unit: 'percent' },
  'lighthouse.BestPractices': { name: 'Best Practices', unit: 'percent' },
  'lighthouse.SEO': { name: 'SEO', unit: 'percent' },
};

export const lighthouseKeys = Object.keys(lighthouseKeyToNameAndUnit) as [
  keyof typeof lighthouseKeyToNameAndUnit
];
