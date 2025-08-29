import { createPlaceholder, removePlaceholder } from '../placeholder';

describe('Placeholder', () => {
  let mockArticle: HTMLElement;
  let mockOnShowPost: jest.Mock;

  beforeEach(() => {
    mockArticle = document.createElement('article');
    mockOnShowPost = jest.fn();
  });

  describe('createPlaceholder', () => {
    it('should create placeholder with correct attributes', () => {
      const placeholder = createPlaceholder(mockArticle, 'post123', 75, mockOnShowPost);

      expect(placeholder.tagName).toBe('ARTICLE');
      expect(placeholder.className).toBe('w-full m-0 reddit-filter-placeholder');
      expect(placeholder.getAttribute('data-filtered-post-id')).toBe('post123');
    });

    it('should create placeholder with correct text content', () => {
      const placeholder = createPlaceholder(mockArticle, 'post123', 75, mockOnShowPost);
      const textElement = placeholder.querySelector('span');

      expect(textElement).toBeDefined();
      expect(textElement?.textContent).toBe('[filtered 75%]');
      expect(textElement?.className).toBe('text-neutral-content-strong');
    });

    it('should apply correct styles', () => {
      const placeholder = createPlaceholder(mockArticle, 'post123', 75, mockOnShowPost);
      
      expect(placeholder.style.padding).toBe('0px 16px');
      expect(placeholder.style.margin).toBe('8px 0px');
      expect(placeholder.style.display).toBe('flex');
      expect(placeholder.style.alignItems).toBe('center');
      expect(placeholder.style.justifyContent).toBe('space-between');
    });

    it('should apply correct text styles', () => {
      const placeholder = createPlaceholder(mockArticle, 'post123', 75, mockOnShowPost);
      const textElement = placeholder.querySelector('span');

      expect(textElement?.style.opacity).toBe('0.75');
      expect(textElement?.style.userSelect).toBe('none');
      expect(textElement?.style.fontStyle).toBe('italic');
      expect(textElement?.style.fontSize).toBe('14px');
      expect(textElement?.style.cursor).toBe('pointer');
    });

    it('should add click event listener', () => {
      const placeholder = createPlaceholder(mockArticle, 'post123', 75, mockOnShowPost);
      const textElement = placeholder.querySelector('span');

      textElement?.click();
      expect(mockOnShowPost).toHaveBeenCalledWith('post123');
    });

    it('should add hover effects', () => {
      const placeholder = createPlaceholder(mockArticle, 'post123', 75, mockOnShowPost);
      const textElement = placeholder.querySelector('span');

      // Test mouseenter
      textElement?.dispatchEvent(new Event('mouseenter'));
      expect(textElement?.style.opacity).toBe('1');

      // Test mouseleave
      textElement?.dispatchEvent(new Event('mouseleave'));
      expect(textElement?.style.opacity).toBe('0.75');
    });

    it('should handle different scores', () => {
      const placeholder1 = createPlaceholder(mockArticle, 'post123', 25, mockOnShowPost);
      const placeholder2 = createPlaceholder(mockArticle, 'post456', 100, mockOnShowPost);

      const text1 = placeholder1.querySelector('span');
      const text2 = placeholder2.querySelector('span');

      expect(text1?.textContent).toBe('[filtered 25%]');
      expect(text2?.textContent).toBe('[filtered 100%]');
    });
  });

  describe('removePlaceholder', () => {
    it('should remove placeholder from DOM when parent exists', () => {
      const parent = document.createElement('div');
      const placeholder = document.createElement('div');
      parent.appendChild(placeholder);

      removePlaceholder(placeholder);
      expect(parent.children).toHaveLength(0);
    });

    it('should handle placeholder without parent gracefully', () => {
      const placeholder = document.createElement('div');
      
      // Should not throw error
      expect(() => removePlaceholder(placeholder)).not.toThrow();
    });

    it('should handle placeholder that is already removed', () => {
      const parent = document.createElement('div');
      const placeholder = document.createElement('div');
      parent.appendChild(placeholder);

      // Remove first time
      removePlaceholder(placeholder);
      expect(parent.children).toHaveLength(0);

      // Remove second time should not cause issues
      expect(() => removePlaceholder(placeholder)).not.toThrow();
    });
  });
});
