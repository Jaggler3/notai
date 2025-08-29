import { PostManager } from '../post-manager';
import { createMockArticle, createMockPostData } from '../../__tests__/utils/test-helpers';

describe('Post Manager', () => {
  let postManager: PostManager;
  let mockOnShowPost: jest.Mock;

  beforeEach(() => {
    postManager = new PostManager();
    mockOnShowPost = jest.fn();
  });

  describe('hidePost', () => {
    it('should hide post and create placeholder', () => {
      const article = createMockArticle('post123', 'Test Post');
      const parent = document.createElement('div');
      parent.appendChild(article);

      postManager.hidePost(article, 'post123', 75, mockOnShowPost);

      expect(article.style.display).toBe('none');
      expect(article.classList.contains('reddit-filter-hidden')).toBe(true);
      expect(parent.children).toHaveLength(2); // article + placeholder
      expect(parent.children[0].className).toContain('reddit-filter-placeholder');
    });

    it('should store post data', () => {
      const article = createMockArticle('post123', 'Test Post');
      postManager.hidePost(article, 'post123', 75, mockOnShowPost);

      expect(postManager.hasPost('post123')).toBe(true);
      expect(postManager.getHiddenPostsCount()).toBe(1);
    });

    it('should handle article without parent gracefully', () => {
      const article = createMockArticle('post123', 'Test Post');
      
      expect(() => {
        postManager.hidePost(article, 'post123', 75, mockOnShowPost);
      }).not.toThrow();

      expect(postManager.hasPost('post123')).toBe(true);
    });
  });

  describe('showPost', () => {
    it('should show post and remove placeholder', () => {
      const article = createMockArticle('post123', 'Test Post');
      postManager.hidePost(article, 'post123', 75, mockOnShowPost);

      const result = postManager.showPost('post123');

      expect(result).toBe(true);
      expect(article.style.display).toBe('block');
      expect(article.classList.contains('reddit-filter-hidden')).toBe(false);
      expect(postManager.hasPost('post123')).toBe(false);
    });

    it('should return false for non-existent post', () => {
      const result = postManager.showPost('nonexistent');
      expect(result).toBe(false);
    });

    it('should remove placeholder from DOM', () => {
      const article = createMockArticle('post123', 'Test Post');
      const parent = document.createElement('div');
      parent.appendChild(article);
      
      postManager.hidePost(article, 'post123', 75, mockOnShowPost);
      const initialChildrenCount = parent.children.length;

      postManager.showPost('post123');
      expect(parent.children.length).toBe(initialChildrenCount - 1);
    });
  });

  describe('showAllPosts', () => {
    it('should show all hidden posts', () => {
      const article1 = createMockArticle('post1', 'Post 1');
      const article2 = createMockArticle('post2', 'Post 2');
      
      postManager.hidePost(article1, 'post1', 75, mockOnShowPost);
      postManager.hidePost(article2, 'post2', 80, mockOnShowPost);

      expect(postManager.getHiddenPostsCount()).toBe(2);

      postManager.showAllPosts();

      expect(article1.style.display).toBe('block');
      expect(article2.style.display).toBe('block');
      expect(article1.classList.contains('reddit-filter-hidden')).toBe(false);
      expect(article2.classList.contains('reddit-filter-hidden')).toBe(false);
      expect(postManager.getHiddenPostsCount()).toBe(0);
    });

    it('should handle no hidden posts', () => {
      expect(() => postManager.showAllPosts()).not.toThrow();
      expect(postManager.getHiddenPostsCount()).toBe(0);
    });
  });

  describe('getHiddenPostNames', () => {
    it('should return list of hidden posts with titles', () => {
      const article1 = createMockArticle('post1', 'Post 1');
      const article2 = createMockArticle('post2', 'Post 2');
      
      postManager.hidePost(article1, 'post1', 75, mockOnShowPost);
      postManager.hidePost(article2, 'post2', 80, mockOnShowPost);

      const hiddenPosts = postManager.getHiddenPostNames();

      expect(hiddenPosts).toHaveLength(2);
      expect(hiddenPosts[0]).toEqual({
        id: 'post1',
        title: 'Post 1',
        score: 75
      });
      expect(hiddenPosts[1]).toEqual({
        id: 'post2',
        title: 'Post 2',
        score: 80
      });
    });

    it('should return empty array when no posts hidden', () => {
      const hiddenPosts = postManager.getHiddenPostNames();
      expect(hiddenPosts).toEqual([]);
    });
  });

  describe('utility methods', () => {
    it('should track hidden posts count correctly', () => {
      expect(postManager.getHiddenPostsCount()).toBe(0);

      const article1 = createMockArticle('post1', 'Post 1');
      postManager.hidePost(article1, 'post1', 75, mockOnShowPost);
      expect(postManager.getHiddenPostsCount()).toBe(1);

      const article2 = createMockArticle('post2', 'Post 2');
      postManager.hidePost(article2, 'post2', 80, mockOnShowPost);
      expect(postManager.getHiddenPostsCount()).toBe(2);

      postManager.showPost('post1');
      expect(postManager.getHiddenPostsCount()).toBe(1);
    });

    it('should check if post exists', () => {
      expect(postManager.hasPost('post123')).toBe(false);

      const article = createMockArticle('post123', 'Test Post');
      postManager.hidePost(article, 'post123', 75, mockOnShowPost);

      expect(postManager.hasPost('post123')).toBe(true);
    });

    it('should clear all posts', () => {
      const article1 = createMockArticle('post1', 'Post 1');
      const article2 = createMockArticle('post2', 'Post 2');
      
      postManager.hidePost(article1, 'post1', 75, mockOnShowPost);
      postManager.hidePost(article2, 'post2', 80, mockOnShowPost);

      expect(postManager.getHiddenPostsCount()).toBe(2);

      postManager.clear();

      expect(postManager.getHiddenPostsCount()).toBe(0);
      expect(postManager.hasPost('post1')).toBe(false);
      expect(postManager.hasPost('post2')).toBe(false);
    });
  });
});
