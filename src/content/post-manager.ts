import { PostData, HiddenPost } from '../types';
import { createPlaceholder, removePlaceholder } from '../filter/placeholder';
import { extractPostTitle } from '../filter/post-processor';

export class PostManager {
  private filteredPosts: Map<string, PostData>;

  constructor() {
    this.filteredPosts = new Map();
  }

  hidePost(article: HTMLElement, postId: string, score: number, onShowPost: (postId: string) => void): void {
    const placeholder = createPlaceholder(article, postId, score, onShowPost);
    
    if (article.parentNode) {
      article.parentNode.insertBefore(placeholder, article);
    }
    
    article.style.display = 'none';
    article.classList.add('reddit-filter-hidden');

    this.filteredPosts.set(postId, { article, placeholder, score });
  }

  showPost(postId: string): boolean {
    const postData = this.filteredPosts.get(postId);
    if (!postData) return false;
    
    const { article, placeholder } = postData;
    
    article.style.display = 'block';
    article.classList.remove('reddit-filter-hidden');
    
    removePlaceholder(placeholder);
    
    this.filteredPosts.delete(postId);
    return true;
  }

  showAllPosts(): void {
    this.filteredPosts.forEach((postData, postId) => {
      const { article, placeholder } = postData;
      
      article.style.display = 'block';
      article.classList.remove('reddit-filter-hidden');
      
      removePlaceholder(placeholder);
    });
    
    this.filteredPosts.clear();
  }

  getHiddenPostNames(): HiddenPost[] {
    const hiddenPosts: HiddenPost[] = [];
    
    this.filteredPosts.forEach((postData, postId) => {
      const { article, score } = postData;
      const title = extractPostTitle(article);
      
      hiddenPosts.push({
        id: postId,
        title: title,
        score: score
      });
    });
    
    console.log('getHiddenPostNames:', hiddenPosts);
    return hiddenPosts;
  }

  getHiddenPostsCount(): number {
    return this.filteredPosts.size;
  }

  hasPost(postId: string): boolean {
    return this.filteredPosts.has(postId);
  }

  clear(): void {
    this.filteredPosts.clear();
  }
}
