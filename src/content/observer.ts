import { RedditPostFilter } from './post-filter';

export class DOMObserver {
  private filter: RedditPostFilter;
  private observer: MutationObserver | null = null;

  constructor(filter: RedditPostFilter) {
    this.filter = filter;
  }

  start(): void {
    this.observer = new MutationObserver((mutations: MutationRecord[]) => {
      if (!this.filter.isEnabled()) return;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.processNewPosts(node as Element);
          }
        });
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  private processNewPosts(node: Element): void {
    const postArticles = node.querySelectorAll ? 
      node.querySelectorAll('article') :
      [];
    
    postArticles.forEach(article => {
      this.filter.filterPost(article as HTMLElement);
    });
  }
}
