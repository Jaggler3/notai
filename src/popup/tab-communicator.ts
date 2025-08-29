export class TabCommunicator {
  async getCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      return tab;
    } catch (error) {
      console.error('Error getting current tab:', error);
      return null;
    }
  }

  async isRedditTab(): Promise<boolean> {
    const tab = await this.getCurrentTab();
    return tab?.url?.includes('reddit.com') || false;
  }

  async sendMessage(message: any): Promise<any> {
    const tab = await this.getCurrentTab();
    if (!tab?.id) return null;

    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tab.id, message, resolve);
    });
  }

  async refreshPage(): Promise<void> {
    const tab = await this.getCurrentTab();
    if (tab?.id) {
      await chrome.tabs.reload(tab.id);
    }
  }
}
