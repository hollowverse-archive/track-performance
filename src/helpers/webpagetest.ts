import { TestResults } from 'webpagetest';

export const getNumberOfRequests = (view: TestResults.View) =>
  view.requests.length;
