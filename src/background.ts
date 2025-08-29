chrome.runtime.onInstalled.addListener(() => {
  console.log('NotAI extension installed');
  
  chrome.storage.sync.set({
    filterEnabled: true,
    scoreThreshold: 10
  });
  
  updateBadge(0);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'postFiltered') {
    updateBadge(request.postsHidden);
    
    chrome.storage.sync.set({
      postsHidden: request.postsHidden,
      lastUpdated: Date.now()
    });
  }
});

function updateBadge(count: number) {
  if (count === 0) {
    chrome.action.setBadgeText({ text: '' });
  } else {
    const badgeText = count > 99 ? '99+' : count.toString();
    chrome.action.setBadgeText({ text: badgeText });
    
    let badgeColor;
    if (count <= 10) {
      badgeColor = '#28a745';
    } else if (count <= 25) {
      badgeColor = '#ffc107';
    } else {
      badgeColor = '#dc3545';
    }
    
    chrome.action.setBadgeBackgroundColor({ color: badgeColor });
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('reddit.com')) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    }).catch(() => {
    });
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.url && tab.url.includes('reddit.com')) {
    chrome.action.setPopup({ popup: 'popup.html' });
  }
});
