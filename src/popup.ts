// Popup script for NotAI
class PopupManager {
  isEnabled: boolean;
  updateInterval: number | null;
  scoreThreshold: number;
  
  constructor() {
    this.isEnabled = true;
    this.updateInterval = null;
    this.scoreThreshold = 10;
    this.init();
  }

  destroy() {
    this.stopPeriodicUpdates();
  }

  async init() {
    await this.loadState();
    this.setupEventListeners();
    this.updateStats();
    
    // Set up periodic updates while popup is open
    this.startPeriodicUpdates();
    
    // Listen for runtime messages from content script
    this.setupRuntimeListener();
  }

  startPeriodicUpdates() {
    // Update every 2 seconds while popup is open
    this.updateInterval = setInterval(() => {
      this.updateStats();
    }, 2000);
  }

  stopPeriodicUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  setupRuntimeListener() {
    // Listen for messages from the content script
    chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: (response: any) => void) => {
      if (request.action === 'postFiltered') {
        // Immediately update the stats when a post is filtered
        this.updateStats();
      }
    });
  }

  async loadState() {
    try {
      const result = await chrome.storage.sync.get(['filterEnabled', 'scoreThreshold']);
      this.isEnabled = result.filterEnabled !== false; // Default to true
      this.scoreThreshold = result.scoreThreshold || 10; // Default to 10 instead of 0
      
      // Update UI to reflect current state
      const filterToggle = document.getElementById('filterToggle') as HTMLInputElement;
      const scoreThreshold = document.getElementById('scoreThreshold') as HTMLInputElement;
      const thresholdValue = document.getElementById('thresholdValue');
      
      if (filterToggle) filterToggle.checked = this.isEnabled;
      if (scoreThreshold) scoreThreshold.value = this.scoreThreshold.toString();
      if (thresholdValue) thresholdValue.textContent = this.scoreThreshold.toString();
    } catch (error) {
      console.error('Error loading state:', error);
    }
  }

  setupEventListeners() {
    // Filter toggle
    const filterToggle = document.getElementById('filterToggle') as HTMLInputElement;
    if (filterToggle) {
      filterToggle.addEventListener('change', (e: Event) => {
        const target = e.target as HTMLInputElement;
        this.isEnabled = target.checked;
        this.toggleFilter();
      });
    }

    // Advanced section toggle
    const advancedToggle = document.getElementById('advancedToggle');
    if (advancedToggle) {
      advancedToggle.addEventListener('click', () => {
        this.toggleAdvancedSection();
      });
    }

    // Score threshold slider
    const scoreThreshold = document.getElementById('scoreThreshold') as HTMLInputElement;
    if (scoreThreshold) {
      scoreThreshold.addEventListener('input', (e: Event) => {
        const target = e.target as HTMLInputElement;
        this.scoreThreshold = parseInt(target.value);
        const thresholdValue = document.getElementById('thresholdValue');
        if (thresholdValue) thresholdValue.textContent = this.scoreThreshold.toString();
        this.updateScoreThreshold();
      });
    }

    // Show all posts button
    const showAll = document.getElementById('showAll');
    if (showAll) {
      showAll.addEventListener('click', () => {
        this.showAllPosts();
      });
    }

    // Refresh page
    const refresh = document.getElementById('refresh');
    if (refresh) {
      refresh.addEventListener('click', () => {
        this.refreshPage();
      });
    }
  }

  toggleAdvancedSection() {
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

  async showAllPosts() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes('reddit.com')) {
        chrome.tabs.sendMessage(tab.id, { action: 'showAllPosts' }, (response: any) => {
          if (response && response.success) {
            this.showMessage('All posts shown', 'success');
            this.updateStats();
          }
        });
      }
    } catch (error) {
      console.error('Error showing all posts:', error);
    }
  }

  async toggleFilter() {
    await this.saveState();
    this.updateContentScript();
    
    const message = this.isEnabled ? 'Filter enabled' : 'Filter disabled';
    this.showMessage(message, 'success');
  }

  async updateContentScript() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes('reddit.com')) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'toggleFilter',
          enabled: this.isEnabled
        });
      }
    } catch (error) {
      console.error('Error updating content script:', error);
    }
  }

  async updateScoreThreshold() {
    await this.saveState();
    this.updateContentScript();
    
    // Send threshold update to content script
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes('reddit.com')) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'updateScoreThreshold',
          threshold: this.scoreThreshold
        });
      }
    } catch (error) {
      console.error('Error updating score threshold in content script:', error);
    }
    
    this.showMessage(`Score threshold set to ${this.scoreThreshold}`, 'success');
  }

  async updateStats() {
    // Get posts hidden count from content script
    this.getPostsHiddenCount();
    this.updateFilterStatus();
    this.getHiddenPostNames();
  }

  async getPostsHiddenCount() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes('reddit.com')) {
        chrome.tabs.sendMessage(tab.id, { action: 'getStats' }, (response: any) => {
          if (response && response.postsHidden !== undefined) {
            const postsHidden = document.getElementById('postsHidden');
            if (postsHidden) postsHidden.textContent = response.postsHidden.toString();
          }
        });
      }
    } catch (error) {
      console.error('Error getting posts hidden count:', error);
    }
  }

  async getHiddenPostNames() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes('reddit.com')) {
        chrome.tabs.sendMessage(tab.id, { action: 'getHiddenPostNames' }, (response: any) => {
          if (response && response.hiddenPosts) {
            this.displayHiddenPosts(response.hiddenPosts);
          }
        });
      }
    } catch (error) {
      console.error('Error getting hidden post names:', error);
    }
  }

  displayHiddenPosts(hiddenPosts: Array<{ id: string; title?: string; score: number }>) {
    const hiddenPostsSection = document.getElementById('hiddenPostsSection');
    const hiddenPostsList = document.getElementById('hiddenPostsList');
    
    if (!hiddenPostsSection || !hiddenPostsList) return;
    
    if (hiddenPosts.length === 0) {
      hiddenPostsSection.style.display = 'none';
      return;
    }
    
    // Show the section
    hiddenPostsSection.style.display = 'block';
    
    // Clear existing content
    hiddenPostsList.innerHTML = '';
    
    // Add each hidden post
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
      
      // Add click handler for show button
      const showButton = postElement.querySelector('.show-post-btn');
      if (showButton) {
        showButton.addEventListener('click', () => {
          this.showSpecificPost(post.id);
        });
      }
      
      hiddenPostsList.appendChild(postElement);
    });
  }

  async showSpecificPost(postId: string) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url && tab.url.includes('reddit.com')) {
        chrome.tabs.sendMessage(tab.id, { 
          action: 'showSpecificPost', 
          postId: postId 
        }, (response: any) => {
          if (response && response.success) {
            this.showMessage('Post shown', 'success');
            // Refresh the hidden posts list
            this.getHiddenPostNames();
            this.updateStats();
          }
        });
      }
    } catch (error) {
      console.error('Error showing specific post:', error);
    }
  }

  updateFilterStatus() {
    const statusElement = document.getElementById('filterStatus');
    if (statusElement) {
      if (this.isEnabled) {
        statusElement.textContent = 'Active';
        statusElement.style.color = '#28a745';
      } else {
        statusElement.textContent = 'Disabled';
        statusElement.style.color = '#dc3545';
      }
    }
  }

  async saveState() {
    try {
      await chrome.storage.sync.set({
        filterEnabled: this.isEnabled,
        scoreThreshold: this.scoreThreshold
      });
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }

  async refreshPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        chrome.tabs.reload(tab.id);
      }
    } catch (error) {
      console.error('Error refreshing page:', error);
    }
  }

  showMessage(message: string, type: 'info' | 'success' | 'error' = 'info') {
    // Create a temporary message element
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.textContent = message;
    
    document.body.appendChild(messageElement);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.parentNode.removeChild(messageElement);
      }
    }, 3000);
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const popupManager = new PopupManager();
  
  // Cleanup when popup is unloaded
  window.addEventListener('beforeunload', () => {
    popupManager.destroy();
  });
});
