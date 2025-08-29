// Background script for NotAI extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('NotAI extension installed');
  
  // Set initial state
  chrome.storage.sync.set({
    filterEnabled: true,
    scoreThreshold: 10
  });
  
  // Initialize badge
  updateBadge(0);
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'postFiltered') {
    // Update badge with new count
    updateBadge(request.postsHidden);
    
    // Store stats for popup
    chrome.storage.sync.set({
      postsHidden: request.postsHidden,
      lastUpdated: Date.now()
    });
  }
});

// Function to update the badge
function updateBadge(count: number) {
  if (count === 0) {
    // Remove badge when no posts are filtered
    chrome.action.setBadgeText({ text: '' });
  } else {
    // Show count, but cap at 99+ for very high numbers
    const badgeText = count > 99 ? '99+' : count.toString();
    chrome.action.setBadgeText({ text: badgeText });
    
    // Set badge color based on count
    let badgeColor;
    if (count <= 10) {
      badgeColor = '#28a745'; // Green for low counts
    } else if (count <= 25) {
      badgeColor = '#ffc107'; // Yellow for medium counts
    } else {
      badgeColor = '#dc3545'; // Red for high counts
    }
    
    chrome.action.setBadgeBackgroundColor({ color: badgeColor });
  }
}

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('reddit.com')) {
    // Inject content script if not already injected
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(() => {
      // Content script might already be injected, ignore error
    });
  }
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes('reddit.com')) {
    // Open popup
    chrome.action.setPopup({ popup: 'popup.html' });
  }
});
