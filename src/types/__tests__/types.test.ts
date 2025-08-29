import { 
  FilterRule, 
  FilterRules, 
  PostData, 
  HiddenPost,
  StorageData,
  StorageResult,
  ContentScriptMessage,
  PopupMessage
} from '../index';

describe('Type Definitions', () => {
  describe('FilterRule', () => {
    it('should have correct structure', () => {
      const rule: FilterRule = {
        weight: 25,
        description: 'Test rule'
      };
      
      expect(rule.weight).toBe(25);
      expect(rule.description).toBe('Test rule');
    });
  });

  describe('FilterRules', () => {
    it('should have all required filter rules', () => {
      const rules: FilterRules = {
        emDashAriaLabel: { weight: 25, description: 'Em dash in title' },
        colonAriaLabel: { weight: 10, description: 'Colon in title' },
        emDashContent: { weight: 30, description: 'Em dash in content' },
        nonFaceEmojis: { weight: 30, description: 'Non-face emojis' },
        longLists: { weight: 35, description: 'Long lists' }
      };
      
      expect(rules.emDashAriaLabel).toBeDefined();
      expect(rules.colonAriaLabel).toBeDefined();
      expect(rules.emDashContent).toBeDefined();
      expect(rules.nonFaceEmojis).toBeDefined();
      expect(rules.longLists).toBeDefined();
    });
  });

  describe('PostData', () => {
    it('should have correct structure', () => {
      const article = document.createElement('article');
      const placeholder = document.createElement('div');
      
      const postData: PostData = {
        article,
        placeholder,
        score: 75
      };
      
      expect(postData.article).toBe(article);
      expect(postData.placeholder).toBe(placeholder);
      expect(postData.score).toBe(75);
    });
  });

  describe('HiddenPost', () => {
    it('should have correct structure', () => {
      const hiddenPost: HiddenPost = {
        id: 'post123',
        title: 'Test Post',
        score: 80
      };
      
      expect(hiddenPost.id).toBe('post123');
      expect(hiddenPost.title).toBe('Test Post');
      expect(hiddenPost.score).toBe(80);
    });
  });

  describe('StorageData', () => {
    it('should have correct structure', () => {
      const storageData: StorageData = {
        filterEnabled: true,
        scoreThreshold: 15
      };
      
      expect(storageData.filterEnabled).toBe(true);
      expect(storageData.scoreThreshold).toBe(15);
    });
  });

  describe('Message Types', () => {
    it('should allow valid ContentScriptMessage types', () => {
      const messages: ContentScriptMessage[] = [
        { action: 'toggleFilter', enabled: true },
        { action: 'updateScoreThreshold', threshold: 20 },
        { action: 'getStats' },
        { action: 'getHiddenPostNames' },
        { action: 'showSpecificPost', postId: 'post123' },
        { action: 'showAllPosts' }
      ];
      
      expect(messages).toHaveLength(6);
      expect(messages[0].action).toBe('toggleFilter');
      expect(messages[1].action).toBe('updateScoreThreshold');
    });

    it('should allow valid PopupMessage types', () => {
      const message: PopupMessage = {
        action: 'postFiltered',
        postsHidden: 5
      };
      
      expect(message.action).toBe('postFiltered');
      expect(message.postsHidden).toBe(5);
    });
  });
});
