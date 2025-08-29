export function createMockArticle(id: string, title?: string, content?: string): HTMLElement {
  const article = document.createElement('article');
  article.setAttribute('aria-label', title || 'Test Post');
  
  const shredditPost = document.createElement('div');
  shredditPost.id = id;
  article.appendChild(shredditPost);
  
  if (content) {
    const p = document.createElement('p');
    p.textContent = content;
    article.appendChild(p);
  }
  
  return article;
}

export function createMockPostData(article: HTMLElement, score: number) {
  const placeholder = document.createElement('div');
  placeholder.className = 'placeholder';
  
  return {
    article,
    placeholder,
    score,
  };
}

export function mockChromeStorage(data: any) {
  (chrome.storage.sync.get as jest.Mock).mockResolvedValue(data);
  (chrome.storage.sync.set as jest.Mock).mockResolvedValue(undefined);
}

export function mockChromeTabs(tab: any) {
  (chrome.tabs.query as jest.Mock).mockResolvedValue([tab]);
  (chrome.tabs.sendMessage as jest.Mock).mockResolvedValue({ success: true });
}

export function mockChromeRuntime() {
  (chrome.runtime.sendMessage as jest.Mock).mockResolvedValue(undefined);
}

// Add a simple test to satisfy Jest
describe('Test Helpers', () => {
  it('should create mock article', () => {
    const article = createMockArticle('test-id', 'Test Title');
    expect(article.tagName).toBe('ARTICLE');
    expect(article.getAttribute('aria-label')).toBe('Test Title');
  });
});
