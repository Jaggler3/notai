import { FilterRules, DEFAULT_FILTER_RULES } from '../filter/filter-rules';
import { calculateScore } from '../filter/post-processor';
import { PostManager } from './post-manager';
import { DOMObserver } from './observer';
import { MessageHandler } from './message-handler';

export class RedditPostFilter {
  private postManager: PostManager;
  private observer: DOMObserver;
  private messageHandler: MessageHandler;
  private _isEnabled: boolean;
  private scoreThreshold: number;
  private filterRules: FilterRules;

  constructor() {
    this.postManager = new PostManager();
    this.observer = new DOMObserver(this);
    this.messageHandler = new MessageHandler(this);
    this._isEnabled = true;
    this.scoreThreshold = 10;
    this.filterRules = DEFAULT_FILTER_RULES;
    
    this.init();
  }

  async init(): Promise<void> {
    await this.loadSettings();
    
    this.observer.start();
    
    this.filterExistingPosts();
    
    chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: (response: any) => void) => {
      this.messageHandler.handleMessage(request, sender, sendResponse);
    });
  }

  async loadSettings(): Promise<void> {
    try {
      const result = await chrome.storage.sync.get(['filterEnabled', 'scoreThreshold']);
      this._isEnabled = result.filterEnabled !== false;
      this.scoreThreshold = result.scoreThreshold !== undefined ? result.scoreThreshold : 10;
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  refilterPosts(): void {
    this.postManager.showAllPosts();
    
    if (this._isEnabled) {
      this.filterExistingPosts();
    }
  }

  filterExistingPosts(): void {
    if (!this._isEnabled) return;
    
    const postArticles = document.querySelectorAll('article');
    postArticles.forEach(article => {
      this.filterPost(article as HTMLElement);
    });
  }

  filterPost(article: HTMLElement): void {
    const shredditPost = article.querySelector('[id]');
    if (!shredditPost || !shredditPost.id) return;
    
    const postId = shredditPost.id;
    
    if (this.postManager.hasPost(postId)) {
      return;
    }
    
    const ariaLabel = article.getAttribute('aria-label');
    const score = calculateScore(ariaLabel, article, this.filterRules);
    
    console.log({ score, threshold: this.scoreThreshold });
    if (score > this.scoreThreshold) {
      console.log("Hiding post:", postId, "Score:", score, "Threshold:", this.scoreThreshold);
      this.postManager.hidePost(article, postId, score, (postId) => this.showSpecificPost(postId));
      this.notifyPopupUpdate();
    } else {
      console.log("Not hiding post:", postId, "Score:", score, "Threshold:", this.scoreThreshold);
    }
  }

  showSpecificPost(postId: string): boolean {
    const success = this.postManager.showPost(postId);
    if (success) {
      this.notifyPopupUpdate();
    }
    return success;
  }

  showAllPosts(): void {
    this.postManager.showAllPosts();
  }

  getHiddenPostNames() {
    return this.postManager.getHiddenPostNames();
  }

  getHiddenPostsCount(): number {
    return this.postManager.getHiddenPostsCount();
  }

  isEnabled(): boolean {
    return this._isEnabled;
  }

  setEnabled(enabled: boolean): void {
    this._isEnabled = enabled;
  }

  setScoreThreshold(threshold: number): void {
    this.scoreThreshold = threshold;
  }

  private notifyPopupUpdate(): void {
    try {
      chrome.runtime.sendMessage({
        action: 'postFiltered',
        postsHidden: this.postManager.getHiddenPostsCount()
      });
    } catch (error) {
      // Ignore errors when popup is not open
    }
  }
}
