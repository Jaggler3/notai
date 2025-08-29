import { hasNonFaceEmojis } from "./emoji-detector";

export interface FilterRule {
  weight: number;
  description: string;
}

export interface FilterRules {
  emDashAriaLabel: FilterRule;
  colonAriaLabel: FilterRule;
  emDashContent: FilterRule;
  nonFaceEmojis: FilterRule;
  longLists: FilterRule;
}

export const DEFAULT_FILTER_RULES: FilterRules = {
  emDashAriaLabel: { weight: 25, description: 'Em dash in title' },
  colonAriaLabel: { weight: 10, description: 'Colon in title' },
  emDashContent: { weight: 30, description: 'Em dash in content' },
  nonFaceEmojis: { weight: 30, description: 'Non-face emojis' },
  longLists: { weight: 35, description: 'Long lists (3+ items)' }
};
