export const DEFAULT_SCORE_THRESHOLD = 10;
export const DEFAULT_FILTER_ENABLED = true;
export const UPDATE_INTERVAL_MS = 2000;
export const MESSAGE_DISPLAY_DURATION_MS = 3000;

export const TITLE_SELECTORS = [
  '[data-testid="post-title"]',
  'h3[class*="title"]',
  'a[class*="title"]',
  'h1, h2, h3',
  '.title'
] as const;
