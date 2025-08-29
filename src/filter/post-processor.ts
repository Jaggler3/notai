import { FilterRules } from '../types';
import { hasNonFaceEmojis } from './emoji-detector';

export function calculateScore(ariaLabel: string | null, article: HTMLElement, filterRules: FilterRules): number {
  let totalScore = 0;
  
  if (ariaLabel && ariaLabel.includes('—')) {
    totalScore += filterRules.emDashAriaLabel.weight;
  }
  
  if (ariaLabel && ariaLabel.includes(': ')) {
    totalScore += filterRules.colonAriaLabel.weight;
  }
  
  const pTags = article.querySelectorAll('p');
  for (const pTag of pTags) {
    if (pTag.textContent && pTag.textContent.includes('—')) {
      totalScore += filterRules.emDashContent.weight;
      break;
    }
  }
  
  for (const pTag of pTags) {
    if (pTag.textContent && hasNonFaceEmojis(pTag.textContent)) {
      totalScore += filterRules.nonFaceEmojis.weight;
      break;
    }
  }
  
  const ulTags = article.querySelectorAll('ul');
  for (const ulTag of ulTags) {
    const listItems = ulTag.querySelectorAll('li');
    if (listItems.length >= 3) {
      totalScore += filterRules.longLists.weight;
      break;
    }
  }
  
  return Math.min(totalScore, 100);
}

export function extractPostTitle(article: HTMLElement): string {
  const titleSelectors = [
    '[data-testid="post-title"]',
    'h3[class*="title"]',
    'a[class*="title"]',
    'h1, h2, h3',
    '.title'
  ];
  
  for (const selector of titleSelectors) {
    const titleElement = article.querySelector(selector);
    if (titleElement && titleElement.textContent) {
      return titleElement.textContent.trim();
    }
  }
  
  // Fallback to aria-label
  const ariaLabel = article.getAttribute('aria-label');
  if (ariaLabel) {
    return ariaLabel.trim();
  }
  
  return 'Untitled Post';
}
