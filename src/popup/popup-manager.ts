import { StorageManager } from './storage-manager';
import { TabCommunicator } from './tab-communicator';
import { MessageDisplay } from './message-display';
import { UIController } from './ui-controller';

export class PopupManager {
  private storageManager: StorageManager;
  private tabCommunicator: TabCommunicator;
  private messageDisplay: MessageDisplay;
  private uiController: UIController;
  private updateInterval: number | null = null;
  private isEnabled: boolean = true;
  private scoreThreshold: number = 10;

  constructor() {
    this.storageManager = new StorageManager();
    this.tabCommunicator = new TabCommunicator();
    this.messageDisplay = new MessageDisplay();
    this.uiController = new UIController(
      this.storageManager,
      this.tabCommunicator,
      this.messageDisplay,
      {
        onFilterToggle: this.handleFilterToggle.bind(this),
        onScoreThresholdChange: this.handleScoreThresholdChange.bind(this),
        onShowAllPosts: this.handleShowAllPosts.bind(this),
        onRefresh: this.handleRefresh.bind(this)
      }
    );
  }

  async init(): Promise<void> {
    await this.loadState();
    this.uiController.setupEventListeners();
    this.updateStats();
    this.startPeriodicUpdates();
    this.setupRuntimeListener();
    this.setupCustomEventListeners();
  }

  destroy(): void {
    this.stopPeriodicUpdates();
  }

  private async loadState(): Promise<void> {
    const state = await this.storageManager.loadState();
    this.isEnabled = state.filterEnabled;
    this.scoreThreshold = state.scoreThreshold;
    await this.uiController.updateUIFromState(state);
  }

  private startPeriodicUpdates(): void {
    this.updateInterval = setInterval(() => {
      this.updateStats();
    }, 2000) as unknown as number;
  }

  private stopPeriodicUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private setupRuntimeListener(): void {
    chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: (response: any) => void) => {
      if (request.action === 'postFiltered') {
        this.updateStats();
      }
    });
  }

  private setupCustomEventListeners(): void {
    document.addEventListener('showSpecificPost', ((event: CustomEvent) => {
      this.handleShowSpecificPost(event.detail.postId);
    }) as EventListener);
  }

  private async handleFilterToggle(enabled: boolean): Promise<void> {
    this.isEnabled = enabled;
    await this.saveState();
    await this.updateContentScript();
    
    const message = enabled ? 'Filter enabled' : 'Filter disabled';
    this.messageDisplay.showMessage(message, 'success');
  }

  private async handleScoreThresholdChange(threshold: number): Promise<void> {
    this.scoreThreshold = threshold;
    await this.saveState();
    await this.updateContentScript();
    
    this.messageDisplay.showMessage(`Score threshold set to ${threshold}`, 'success');
  }

  private async handleShowAllPosts(): Promise<void> {
    if (await this.tabCommunicator.isRedditTab()) {
      const response = await this.tabCommunicator.sendMessage({ action: 'showAllPosts' });
      if (response?.success) {
        this.messageDisplay.showMessage('All posts shown', 'success');
        this.updateStats();
      }
    }
  }

  private async handleShowSpecificPost(postId: string): Promise<void> {
    if (await this.tabCommunicator.isRedditTab()) {
      const response = await this.tabCommunicator.sendMessage({ 
        action: 'showSpecificPost', 
        postId: postId 
      });
      if (response?.success) {
        this.messageDisplay.showMessage('Post shown', 'success');
        this.updateStats();
      }
    }
  }

  private async handleRefresh(): Promise<void> {
    await this.tabCommunicator.refreshPage();
  }

  private async saveState(): Promise<void> {
    await this.storageManager.saveState({
      filterEnabled: this.isEnabled,
      scoreThreshold: this.scoreThreshold
    });
  }

  private async updateContentScript(): Promise<void> {
    if (await this.tabCommunicator.isRedditTab()) {
      await this.tabCommunicator.sendMessage({
        action: 'toggleFilter',
        enabled: this.isEnabled
      });
    }
  }

  private async updateStats(): Promise<void> {
    if (await this.tabCommunicator.isRedditTab()) {
      await this.getPostsHiddenCount();
      await this.getHiddenPostNames();
    }
    this.uiController.updateFilterStatus(this.isEnabled);
  }

  private async getPostsHiddenCount(): Promise<void> {
    const response = await this.tabCommunicator.sendMessage({ action: 'getStats' });
    if (response?.postsHidden !== undefined) {
      this.uiController.updatePostsHiddenCount(response.postsHidden);
    }
  }

  private async getHiddenPostNames(): Promise<void> {
    const response = await this.tabCommunicator.sendMessage({ action: 'getHiddenPostNames' });
    if (response?.hiddenPosts) {
      await this.uiController.updateHiddenPostsList(response.hiddenPosts);
    }
  }
}
