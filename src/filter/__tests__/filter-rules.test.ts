import { DEFAULT_FILTER_RULES, FilterRules } from '../filter-rules';

describe('Filter Rules', () => {
  describe('DEFAULT_FILTER_RULES', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_FILTER_RULES.emDashAriaLabel.weight).toBe(25);
      expect(DEFAULT_FILTER_RULES.emDashAriaLabel.description).toBe('Em dash in title');
      
      expect(DEFAULT_FILTER_RULES.colonAriaLabel.weight).toBe(10);
      expect(DEFAULT_FILTER_RULES.colonAriaLabel.description).toBe('Colon in title');
      
      expect(DEFAULT_FILTER_RULES.emDashContent.weight).toBe(30);
      expect(DEFAULT_FILTER_RULES.emDashContent.description).toBe('Em dash in content');
      
      expect(DEFAULT_FILTER_RULES.nonFaceEmojis.weight).toBe(30);
      expect(DEFAULT_FILTER_RULES.nonFaceEmojis.description).toBe('Non-face emojis');
      
      expect(DEFAULT_FILTER_RULES.longLists.weight).toBe(35);
      expect(DEFAULT_FILTER_RULES.longLists.description).toBe('Long lists (3+ items)');
    });
  });

  describe('FilterRules interface', () => {
    it('should allow custom filter rules', () => {
      const customRules: FilterRules = {
        emDashAriaLabel: { weight: 50, description: 'Custom em dash rule' },
        colonAriaLabel: { weight: 20, description: 'Custom colon rule' },
        emDashContent: { weight: 60, description: 'Custom content rule' },
        nonFaceEmojis: { weight: 40, description: 'Custom emoji rule' },
        longLists: { weight: 70, description: 'Custom list rule' }
      };
      
      expect(customRules.emDashAriaLabel.weight).toBe(50);
      expect(customRules.emDashAriaLabel.description).toBe('Custom em dash rule');
    });
  });
});
