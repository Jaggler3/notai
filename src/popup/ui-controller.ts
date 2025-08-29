import { StorageData } from '../types';
import { StorageManager } from './storage-manager';
import { TabCommunicator } from './tab-communicator';
import { MessageDisplay } from './message-display';

export class UIController {
  private storageManager: StorageManager;
  private tabCommunicator: TabCommunicator;
  private messageDisplay: MessageDisplay;
  private onFilterToggle: (enabled: boolean) => void;
  private onScoreThresholdChange: (threshold: number) => void;
  private onShowAllPosts: () => void;
  private onRefresh: () => void;

  constructor(
    storageManager: StorageManager,
    tabCommunicator: TabCommunicator,
    messageDisplay: MessageDisplay,
    callbacks: {
      onFilterToggle: (enabled: boolean) => void;
      onScoreThresholdChange: (threshold: number) => void;
      onShowAllPosts: () => void;
      onRefresh: () => void;
    }
  ) {
    this.storageManager = storageManager;
    this.tabCommunicator = tabCommunicator;
    this.messageDisplay = messageDisplay;
    this.onFilterToggle = callbacks.onFilterToggle;
    this.onScoreThresholdChange = callbacks.onScoreThresholdChange;
    this.onShowAllPosts = callbacks.onShowAllPosts;
    this.onRefresh = callbacks.onRefresh;
  }

  setupEventListeners(): void {
    this.setupFilterToggle();
    this.setupAdvancedToggle();
    this.setupScoreThreshold();
    this.setupShowAllButton();
    this.setupRefreshButton();
  }

  private setupFilterToggle(): void {
    const filterToggle = document.getElementById('filterToggle') as HTMLInputElement;
    if (filterToggle) {
      filterToggle.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        this.onFilterToggle(target.checked);
      });
    }
  }

  private setupAdvancedToggle(): void {
    const advancedToggle = document.getElementById('advancedToggle');
    if (advancedToggle) {
      advancedToggle.addEventListener('click', () => {
        this.toggleAdvancedSection();
      });
    }
  }

  private setupScoreThreshold(): void {
    const scoreThreshold = document.getElementById('scoreThreshold') as HTMLInputElement;
    if (scoreThreshold) {
      scoreThreshold.addEventListener('input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        const value = parseInt(target.value);
        const thresholdValue = document.getElementById('thresholdValue');
        if (thresholdValue) thresholdValue.textContent = value.toString();
        this.onScoreThresholdChange(value);
      });
    }
  }

  private setupShowAllButton(): void {
    const showAll = document.getElementById('showAll');
    if (showAll) {
      showAll.addEventListener('click', () => {
        this.onShowAllPosts();
      });
    }
  }

  private setupRefreshButton(): void {
    const refresh = document.getElementById('refresh');
    if (refresh) {
      refresh.addEventListener('click', () => {
        this.onRefresh();
      });
    }
  }

  private toggleAdvancedSection(): void {
    const advancedToggle = document.getElementById('advancedToggle');
    const advancedContent = document.getElementById('advancedContent');
    
    if (advancedToggle && advancedContent) {
      if (advancedContent.classList.contains('expanded')) {
        advancedContent.classList.remove('expanded');
        advancedToggle.classList.remove('expanded');
      } else {
        advancedContent.classList.add('expanded');
        advancedToggle.classList.add('expanded');
      }
    }
  }

  updateFilterStatus(isEnabled: boolean): void {
    const statusElement = document.getElementById('filterStatus');
    if (statusElement) {
      if (isEnabled) {
        statusElement.textContent = 'Active';
        statusElement.style.color = '#28a745';
      } else {
        statusElement.textContent = 'Disabled';
        statusElement.style.color = '#dc3545';
      }
    }
  }

  updatePostsHiddenCount(count: number): void {
    const postsHidden = document.getElementById('postsHidden');
    if (postsHidden) postsHidden.textContent = count.toString();
  }

  async updateUIFromState(data: StorageData): Promise<void> {
    const filterToggle = document.getElementById('filterToggle') as HTMLInputElement;
    const scoreThreshold = document.getElementById('scoreThreshold') as HTMLInputElement;
    const thresholdValue = document.getElementById('thresholdValue');
    
    if (filterToggle) filterToggle.checked = data.filterEnabled;
    if (scoreThreshold) scoreThreshold.value = data.scoreThreshold.toString();
    if (thresholdValue) thresholdValue.textContent = data.scoreThreshold.toString();
  }

  async updateHiddenPostsList(hiddenPosts: Array<{ id: string; title: string; score: number }>): Promise<void> {
    const hiddenPostsList = document.getElementById('hiddenPostsList');
    if (!hiddenPostsList) return;

    hiddenPostsList.innerHTML = '';
    
    hiddenPosts.forEach(post => {
      const postElement = document.createElement('div');
      postElement.className = 'hidden-post-item';
      postElement.innerHTML = `
        <div class="post-info">
          <span class="post-title">${post.title || 'Untitled Post'}</span>
          <span class="post-score">Score: ${post.score}%</span>
        </div>
        <button class="show-post-btn" data-post-id="${post.id}">Show</button>
      `;
      
      const showButton = postElement.querySelector('.show-post-btn');
      if (showButton) {
        showButton.addEventListener('click', () => {
          // This will be handled by the main popup manager
          const event = new CustomEvent('showSpecificPost', { detail: { postId: post.id } });
          document.dispatchEvent(event);
        });
      }
      
      hiddenPostsList.appendChild(postElement);
    });
  }
}
