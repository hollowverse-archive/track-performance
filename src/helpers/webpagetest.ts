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

export const lighthouseKeyToName: Record<
  keyof TestResults.LighthouseResults,
  { name: string }
> = {
  'lighthouse.Performance': { name: 'Performance' },
  'lighthouse.Performance.first-meaningful-paint': {
    name: 'First Meaningful Paint',
  },
  'lighthouse.Performance.first-interactive': {
    name: 'First Interactive',
  },
  'lighthouse.Performance.consistently-interactive': {
    name: 'Consistently Interactive',
  },
  'lighthouse.Performance.speed-index-metric': {
    name: 'Speed Index Metric',
  },
  'lighthouse.Performance.estimated-input-latency': {
    name: 'Estimated Input Latency',
  },
  'lighthouse.ProgressiveWebApp': { name: 'PWA' },
  'lighthouse.Accessibility': { name: 'Accessibility' },
  'lighthouse.BestPractices': { name: 'Best Practices' },
  'lighthouse.SEO': { name: 'SEO' },
};

export const lighthouseKeys = Object.keys(lighthouseKeyToName) as [
  keyof typeof lighthouseKeyToName
];
