import { TestResults } from 'webpagetest';

export const getNumberOfRequests = (view: TestResults.View) =>
  view.requests.length;

export const hasLighthouseData = (
  view: TestResults.View,
): view is TestResults.View<TestResults.LighthouseResults> => {
  return 'lighthouse.Performance' in view;
};

export const lighthouseKeyToName: Record<
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

export const lighthouseKeys = Object.keys(lighthouseKeyToName) as [
  keyof typeof lighthouseKeyToName
];
