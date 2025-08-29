import { calculateScore, extractPostTitle } from '../post-processor';
import { DEFAULT_FILTER_RULES } from '../filter-rules';

describe('Post Processor', () => {
  describe('calculateScore', () => {
    let mockArticle: HTMLElement;

    beforeEach(() => {
      mockArticle = document.createElement('article');
    });

    it('should return 0 for articles with no matching criteria', () => {
      const score = calculateScore('Simple title', mockArticle, DEFAULT_FILTER_RULES);
      expect(score).toBe(0);
    });

    it('should add score for em dash in aria-label', () => {
      const score = calculateScore('Title with — dash', mockArticle, DEFAULT_FILTER_RULES);
      expect(score).toBe(DEFAULT_FILTER_RULES.emDashAriaLabel.weight);
    });

    it('should add score for colon in aria-label', () => {
      const score = calculateScore('Title: with colon', mockArticle, DEFAULT_FILTER_RULES);
      expect(score).toBe(DEFAULT_FILTER_RULES.colonAriaLabel.weight);
    });

    it('should add score for em dash in content', () => {
      const p = document.createElement('p');
      p.textContent = 'Content with — dash';
      mockArticle.appendChild(p);

      const score = calculateScore('Simple title', mockArticle, DEFAULT_FILTER_RULES);
      expect(score).toBe(DEFAULT_FILTER_RULES.emDashContent.weight);
    });

    it('should add score for non-face emojis in content', () => {
      const p = document.createElement('p');
      p.textContent = 'Content with 🚀 emoji';
      mockArticle.appendChild(p);

      const score = calculateScore('Simple title', mockArticle, DEFAULT_FILTER_RULES);
      expect(score).toBe(DEFAULT_FILTER_RULES.nonFaceEmojis.weight);
    });

    it('should add score for long lists', () => {
      const ul = document.createElement('ul');
      for (let i = 0; i < 3; i++) {
        const li = document.createElement('li');
        li.textContent = `Item ${i}`;
        ul.appendChild(li);
      }
      mockArticle.appendChild(ul);

      const score = calculateScore('Simple title', mockArticle, DEFAULT_FILTER_RULES);
      expect(score).toBe(DEFAULT_FILTER_RULES.longLists.weight);
    });

    it('should combine multiple scores', () => {
      const p = document.createElement('p');
      p.textContent = 'Content with — dash and 🚀 emoji';
      mockArticle.appendChild(p);

      const score = calculateScore('Title with — dash', mockArticle, DEFAULT_FILTER_RULES);
      const expectedScore = DEFAULT_FILTER_RULES.emDashAriaLabel.weight + 
                           DEFAULT_FILTER_RULES.emDashContent.weight + 
                           DEFAULT_FILTER_RULES.nonFaceEmojis.weight;
      
      expect(score).toBe(expectedScore);
    });

    it('should cap score at 100', () => {
      const p = document.createElement('p');
      p.textContent = 'Content with — dash and 🚀 emoji';
      mockArticle.appendChild(p);

      const ul = document.createElement('ul');
      for (let i = 0; i < 5; i++) {
        const li = document.createElement('li');
        li.textContent = `Item ${i}`;
        ul.appendChild(li);
      }
      mockArticle.appendChild(ul);

      const score = calculateScore('Title with — dash', mockArticle, DEFAULT_FILTER_RULES);
      expect(score).toBe(100); // Should be capped at 100
    });

    it('should handle null aria-label', () => {
      const score = calculateScore(null, mockArticle, DEFAULT_FILTER_RULES);
      expect(score).toBe(0);
    });
  });

  describe('extractPostTitle', () => {
    let mockArticle: HTMLElement;

    beforeEach(() => {
      mockArticle = document.createElement('article');
    });

    it('should extract title from data-testid="post-title"', () => {
      const titleElement = document.createElement('h3');
      titleElement.setAttribute('data-testid', 'post-title');
      titleElement.textContent = 'Test Post Title';
      mockArticle.appendChild(titleElement);

      const title = extractPostTitle(mockArticle);
      expect(title).toBe('Test Post Title');
    });

    it('should extract title from h3 with title class', () => {
      const titleElement = document.createElement('h3');
      titleElement.className = 'title';
      titleElement.textContent = 'Test Post Title';
      mockArticle.appendChild(titleElement);

      const title = extractPostTitle(mockArticle);
      expect(title).toBe('Test Post Title');
    });

    it('should fallback to aria-label', () => {
      mockArticle.setAttribute('aria-label', 'Fallback Title');

      const title = extractPostTitle(mockArticle);
      expect(title).toBe('Fallback Title');
    });

    it('should return "Untitled Post" when no title found', () => {
      const title = extractPostTitle(mockArticle);
      expect(title).toBe('Untitled Post');
    });

    it('should prioritize first matching selector', () => {
      const h1 = document.createElement('h1');
      h1.textContent = 'H1 Title';
      mockArticle.appendChild(h1);

      const h3 = document.createElement('h3');
      h3.setAttribute('data-testid', 'post-title');
      h3.textContent = 'H3 Title';
      mockArticle.appendChild(h3);

      const title = extractPostTitle(mockArticle);
      expect(title).toBe('H1 Title'); // H1 comes first in selectors
    });
  });
});
