// NotAI Content Script

interface FilterRule {
  weight: number;
  description: string;
}

interface FilterRules {
  emDashAriaLabel: FilterRule;
  colonAriaLabel: FilterRule;
  emDashContent: FilterRule;
  nonFaceEmojis: FilterRule;
  longLists: FilterRule;
}

interface PostData {
  article: HTMLElement;
  placeholder: HTMLElement;
  score: number;
}

interface HiddenPost {
  id: string;
  title: string;
  score: number;
}

class RedditPostFilter {
  private filteredPosts: Map<string, PostData>;
  private isEnabled: boolean;
  private scoreThreshold: number;
  private filterRules: FilterRules;

  constructor() {
    this.filteredPosts = new Map(); // Map to store post id -> {article, placeholder, score}
    this.isEnabled = true;
    this.scoreThreshold = 10; // Default to 10 instead of 0
    this.filterRules = {
      emDashAriaLabel: { weight: 25, description: 'Em dash in title' },
      colonAriaLabel: { weight: 10, description: 'Colon in title' },
      emDashContent: { weight: 30, description: 'Em dash in content' },
      nonFaceEmojis: { weight: 30, description: 'Non-face emojis' },
      longLists: { weight: 35, description: 'Long lists (3+ items)' }
    };
    this.init();
  }

  async init() {
    // Load saved settings
    await this.loadSettings();
    
    // Start observing for new posts
    this.startObserver();
    
    // Filter existing posts
    this.filterExistingPosts();
    
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request: any, sender: any, sendResponse: (response: any) => void) => {
      if (request.action === 'toggleFilter') {
        this.isEnabled = request.enabled;
        if (this.isEnabled) {
          this.filterExistingPosts();
        } else {
          this.showAllPosts();
        }
        sendResponse({ success: true });
      } else if (request.action === 'updateScoreThreshold') {
        this.scoreThreshold = request.threshold;
        this.refilterPosts();
        sendResponse({ success: true });
      } else if (request.action === 'getStats') {
        sendResponse({ 
          postsHidden: this.filteredPosts.size,
          isEnabled: this.isEnabled
        });
      } else if (request.action === 'getHiddenPostNames') {
        const hiddenPosts = this.getHiddenPostNames();
        sendResponse({ hiddenPosts });
      } else if (request.action === 'showSpecificPost') {
        const success = this.showSpecificPost(request.postId);
        sendResponse({ success });
      } else if (request.action === 'showAllPosts') {
        this.showAllPosts();
        sendResponse({ success: true });
      }
    });
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get(['filterEnabled', 'scoreThreshold']);
      this.isEnabled = result.filterEnabled !== false;
      this.scoreThreshold = result.scoreThreshold !== undefined ? result.scoreThreshold : 10;
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  refilterPosts() {
    // Clear current filtered posts
    this.showAllPosts();
    
    // Re-apply filtering with new threshold
    if (this.isEnabled) {
      this.filterExistingPosts();
    }
  }

  startObserver() {
    // Use MutationObserver to watch for new posts being added
    const observer = new MutationObserver((mutations: MutationRecord[]) => {
      if (!this.isEnabled) return;
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this.processNewPosts(node as Element);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  processNewPosts(node: Element) {
    // Look for Reddit post articles
    const postArticles = node.querySelectorAll ? 
      node.querySelectorAll('article') :
      [];
    
    postArticles.forEach(article => {
      this.filterPost(article as HTMLElement);
    });
  }

  filterExistingPosts() {
    if (!this.isEnabled) return;
    
    const postArticles = document.querySelectorAll('article');
    postArticles.forEach(article => {
      this.filterPost(article as HTMLElement);
    });
  }

  filterPost(article: HTMLElement) {
    // Find the shreddit-post child element
    const shredditPost = article.querySelector('[id]');
    if (!shredditPost || !shredditPost.id) return;
    
    const postId = shredditPost.id;
    
    // Check if we already have a placeholder for this post
    if (this.filteredPosts.has(postId)) {
      return; // Already filtered, skip
    }
    
    const ariaLabel = article.getAttribute('aria-label');
    const score = this.calculateScore(ariaLabel, article);
    
    // Only filter posts if score meets or exceeds the threshold
    console.log({ score, threshold: this.scoreThreshold });
    if (score > this.scoreThreshold) {
      console.log("Hiding post:", postId, "Score:", score, "Threshold:", this.scoreThreshold);
      this.hidePost(article, postId, score);
    } else {
      console.log("Not hiding post:", postId, "Score:", score, "Threshold:", this.scoreThreshold);
    }
  }

  calculateScore(ariaLabel: string | null, article: HTMLElement): number {
    let totalScore = 0;
    
    // Check for em dash (—) in aria-label
    if (ariaLabel && ariaLabel.includes('—')) {
      totalScore += this.filterRules.emDashAriaLabel.weight;
    }
    
    // Check for colon (:) in aria-label
    if (ariaLabel && ariaLabel.includes(': ')) {
      totalScore += this.filterRules.colonAriaLabel.weight;
    }
    
    // Check for em dash (—) in p tag children
    const pTags = article.querySelectorAll('p');
    for (const pTag of pTags) {
      if (pTag.textContent && pTag.textContent.includes('—')) {
        totalScore += this.filterRules.emDashContent.weight;
        break; // Only count once per post
      }
    }
    
    // Check for non-face emojis in p tag content
    for (const pTag of pTags) {
      if (pTag.textContent && this.hasNonFaceEmojis(pTag.textContent)) {
        totalScore += this.filterRules.nonFaceEmojis.weight;
        break; // Only count once per post
      }
    }
    
    // Check for ul children with 3 or more items
    const ulTags = article.querySelectorAll('ul');
    for (const ulTag of ulTags) {
      const listItems = ulTag.querySelectorAll('li');
      if (listItems.length >= 3) {
        totalScore += this.filterRules.longLists.weight;
        break; // Only count once per post
      }
    }
    
    // Cap the score at 100%
    return Math.min(totalScore, 100);
  }

  hasNonFaceEmojis(text: string): boolean {
    // Unicode ranges for emojis
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE00}-\u{FE0F}]|[\u{1FAB0}-\u{1FABF}]|[\u{1F4A0}-\u{1F4AF}]|[\u{1F4B0}-\u{1F4BF}]|[\u{1F4C0}-\u{1F4CF}]|[\u{1F4D0}-\u{1F4DF}]|[\u{1F4E0}-\u{1F4EF}]|[\u{1F4F0}-\u{1F4FF}]|[\u{1F500}-\u{1F50F}]|[\u{1F510}-\u{1F51F}]|[\u{1F520}-\u{1F52F}]|[\u{1F530}-\u{1F53F}]|[\u{1F540}-\u{1F54F}]|[\u{1F550}-\u{1F55F}]|[\u{1F560}-\u{1F56F}]|[\u{1F570}-\u{1F57F}]|[\u{1F580}-\u{1F58F}]|[\u{1F590}-\u{1F59F}]|[\u{1F5A0}-\u{1F5AF}]|[\u{1F5B0}-\u{1F5BF}]|[\u{1F5C0}-\u{1F5CF}]|[\u{1F5D0}-\u{1F5DF}]|[\u{1F5E0}-\u{1F5EF}]|[\u{1F5F0}-\u{1F5FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F650}-\u{1F65F}]|[\u{1F660}-\u{1F66F}]|[\u{1F670}-\u{1F67F}]|[\u{1F680}-\u{1F68F}]|[\u{1F690}-\u{1F69F}]|[\u{1F6A0}-\u{1F6AF}]|[\u{1F6B0}-\u{1F6BF}]|[\u{1F6C0}-\u{1F6CF}]|[\u{1F6D0}-\u{1F6DF}]|[\u{1F6E0}-\u{1F6EF}]|[\u{1F6F0}-\u{1F6FF}]|[\u{1F910}-\u{1F91F}]|[\u{1F920}-\u{1F92F}]|[\u{1F930}-\u{1F93F}]|[\u{1F940}-\u{1F94F}]|[\u{1F950}-\u{1F95F}]|[\u{1F960}-\u{1F96F}]|[\u{1F970}-\u{1F97F}]|[\u{1F980}-\u{1F98F}]|[\u{1F990}-\u{1F99F}]|[\u{1F9A0}-\u{1F9AF}]|[\u{1F9B0}-\u{1F9BF}]|[\u{1F9C0}-\u{1F9CF}]|[\u{1F9D0}-\u{1F9DF}]|[\u{1F9E0}-\u{1F9EF}]|[\u{1F9F0}-\u{1F9FF}]/gu;
    
    const emojis = text.match(emojiRegex);
    if (!emojis) return false;
    
    // Face emoji ranges (smileys, people, etc.)
    const faceEmojiRanges: [number, number][] = [
      [0x1F600, 0x1F64F], // Emoticons
      [0x1F910, 0x1F92F], // Face with hand covering mouth, nauseated face, etc.
      [0x1F930, 0x1F93F], // Pregnant woman, etc.
      [0x1F970, 0x1F97F], // Smiling face with hearts, etc.
      [0x1F9D0, 0x1F9DF], // Yawning face, etc.
      [0x1FA70, 0x1FA7F], // Ballet shoes, etc.
      [0x1FA80, 0x1FA8F], // Yo-yo, etc.
      [0x1FA90, 0x1FA9F], // Ringed planet, etc.
      [0x1FAA0, 0x1FAAF], // Hamsa, etc.
      [0x1FAB0, 0x1FABF], // Fly, etc.
      [0x1FAC0, 0x1FAFF]  // Heart hands, etc.
    ];
    
    // Check if any emoji is NOT a face emoji
    for (const emoji of emojis) {
      const codePoint = emoji.codePointAt(0);
      if (codePoint === undefined) continue;
      
      let isFaceEmoji = false;
      
      for (const [start, end] of faceEmojiRanges) {
        if (codePoint >= start && codePoint <= end) {
          isFaceEmoji = true;
          break;
        }
      }
      
      if (!isFaceEmoji) {
        return true; // Found a non-face emoji, filter this post
      }
    }
    
    return false; // Only face emojis found
  }

  hidePost(article: HTMLElement, postId: string, score: number) {
    // Create placeholder element
    const placeholder = this.createPlaceholder(article, postId, score);
    
    // Insert placeholder before the article
    if (article.parentNode) {
      article.parentNode.insertBefore(placeholder, article);
    }
    
    // Hide the original article
    article.style.display = 'none';
    article.classList.add('reddit-filter-hidden');

    // Store the mapping using the post ID
    this.filteredPosts.set(postId, { article, placeholder, score });
    
    // Notify any open popups about the new filtered post
    this.notifyPopupUpdate();
  }

  notifyPopupUpdate() {
    // Try to notify any open popups about the update
    try {
      chrome.runtime.sendMessage({
        action: 'postFiltered',
        postsHidden: this.filteredPosts.size
      });
    } catch (error) {
      // Popup might not be open, ignore error
    }
  }

  createPlaceholder(article: HTMLElement, postId: string, score: number): HTMLElement {
    const placeholder = document.createElement('article');
    placeholder.className = 'w-full m-0 reddit-filter-placeholder';
    placeholder.setAttribute('data-filtered-post-id', postId); // Store the post ID for reference
    placeholder.style.cssText = `
      padding: 0 16px;
      margin: 8px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;
    
    // Create the [filtered xx%] text
    const filteredText = document.createElement('span');
    filteredText.className = 'text-neutral-content-strong';
    filteredText.textContent = `[filtered ${score}%]`;
    filteredText.style.cssText = `
      opacity: 0.75;
      user-select: none;
      font-style: italic;
      font-size: 14px;
      cursor: pointer;
    `;
    
    // Add hover effect
    filteredText.addEventListener('mouseenter', () => {
      filteredText.style.opacity = '1';
    });
    
    filteredText.addEventListener('mouseleave', () => {
      filteredText.style.opacity = '0.75';
    });
    
    // Add click handler to show the post
    filteredText.addEventListener('click', () => {
      this.showPost(postId);
    });
    
    // Append elements to placeholder
    placeholder.appendChild(filteredText);
    
    return placeholder;
  }

  showPost(postId: string) {
    const postData = this.filteredPosts.get(postId);
    if (!postData) return;
    
    const { article, placeholder } = postData;
    
    // Show the original article
    article.style.display = 'block';
    article.classList.remove('reddit-filter-hidden');
    
    // Remove the placeholder
    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.removeChild(placeholder);
    }
    
    // Remove from filtered posts map
    this.filteredPosts.delete(postId);
  }

  showAllPosts() {
    // Show all hidden posts
    this.filteredPosts.forEach((postData, postId) => {
      const { article, placeholder } = postData;
      
      article.style.display = 'block';
      article.classList.remove('reddit-filter-hidden');
      
      if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.removeChild(placeholder);
      }
    });
    
    // Clear the map
    this.filteredPosts.clear();
  }

  getHiddenPostNames(): HiddenPost[] {
    const hiddenPosts: HiddenPost[] = [];
    
    this.filteredPosts.forEach((postData, postId) => {
      const { article, score } = postData;
      
      // Try to extract the post title from various possible selectors
      let title = 'Untitled Post';
      const titleSelectors = [
        '[data-testid="post-title"]',
        'h3[class*="title"]',
        'a[class*="title"]',
        'h1, h2, h3',
        '.title'
      ];
      
      for (const selector of titleSelectors) {
        const titleElement = article.querySelector(selector);
        if (titleElement && titleElement.textContent) {
          title = titleElement.textContent.trim();
          break;
        }
      }
      
      // Fallback to aria-label if no title found
      if (title === 'Untitled Post') {
        const ariaLabel = article.getAttribute('aria-label');
        if (ariaLabel) {
          title = ariaLabel.trim();
        }
      }
      
      hiddenPosts.push({
        id: postId,
        title: title,
        score: score
      });
    });
    
    console.log('getHiddenPostNames:', hiddenPosts);
    return hiddenPosts;
  }

  showSpecificPost(postId: string): boolean {
    const postData = this.filteredPosts.get(postId);
    if (!postData) return false;

    const { article, placeholder } = postData;

    // Show the original article
    article.style.display = 'block';
    article.classList.remove('reddit-filter-hidden');

    // Remove the placeholder
    if (placeholder && placeholder.parentNode) {
      placeholder.parentNode.removeChild(placeholder);
    }

    // Remove from filtered posts map
    this.filteredPosts.delete(postId);
    
    // Update badge count
    this.notifyPopupUpdate();
    
    return true;
  }
}

// Initialize the filter when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new RedditPostFilter();
  });
} else {
  new RedditPostFilter();
}
