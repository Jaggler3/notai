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

export interface PostData {
  article: HTMLElement;
  placeholder: HTMLElement;
  score: number;
}

export interface HiddenPost {
  id: string;
  title: string;
  score: number;
}
