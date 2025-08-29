import { ContentScriptMessage, StatsResponse, HiddenPostsResponse, SuccessResponse } from '../types';
import { RedditPostFilter } from './post-filter';

export class MessageHandler {
  private filter: RedditPostFilter;

  constructor(filter: RedditPostFilter) {
    this.filter = filter;
  }

  handleMessage(request: ContentScriptMessage, sender: any, sendResponse: (response: any) => void): void {
    switch (request.action) {
      case 'toggleFilter':
        this.filter.setEnabled(request.enabled);
        if (request.enabled) {
          this.filter.filterExistingPosts();
        } else {
          this.filter.showAllPosts();
        }
        sendResponse({ success: true } as SuccessResponse);
        break;

      case 'updateScoreThreshold':
        this.filter.setScoreThreshold(request.threshold);
        this.filter.refilterPosts();
        sendResponse({ success: true } as SuccessResponse);
        break;

      case 'getStats':
        sendResponse({
          postsHidden: this.filter.getHiddenPostsCount(),
          isEnabled: this.filter.isEnabled()
        } as StatsResponse);
        break;

      case 'getHiddenPostNames':
        const hiddenPosts = this.filter.getHiddenPostNames();
        sendResponse({ hiddenPosts } as HiddenPostsResponse);
        break;

      case 'showSpecificPost':
        const success = this.filter.showSpecificPost(request.postId);
        sendResponse({ success } as SuccessResponse);
        break;

      case 'showAllPosts':
        this.filter.showAllPosts();
        sendResponse({ success: true } as SuccessResponse);
        break;

      default:
        console.warn('Unknown message action:', request);
        sendResponse({ success: false } as SuccessResponse);
    }
  }
}
