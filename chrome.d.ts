// This file provides Chrome extension API types for the project

declare namespace chrome {
  namespace action {
    function setPopup(options: { popup: string }): void;
    function setBadgeText(options: { text: string }): void;
    function setBadgeBackgroundColor(options: { color: string }): void;
    const onClicked: {
      addListener(listener: (tab: chrome.tabs.Tab) => void): void;
    };
  }
  
  namespace storage {
    namespace sync {
      function get(keys: string[]): Promise<{ [key: string]: any }>;
      function set(items: { [key: string]: any }): Promise<void>;
    }
  }
  
  namespace runtime {
    function sendMessage(message: any): void;
    const onMessage: {
      addListener(listener: (message: any, sender: any, sendResponse: (response: any) => void) => void): void;
    };
    const onInstalled: {
      addListener(listener: () => void): void;
    };
  }
  
  namespace tabs {
    function query(queryInfo: { active: boolean; currentWindow: boolean }): Promise<chrome.tabs.Tab[]>;
    function sendMessage(tabId: number, message: any, callback?: (response: any) => void): void;
    function reload(tabId: number): void;
    const onUpdated: {
      addListener(listener: (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => void): void;
    };

    interface Tab {
      id: number;
      url?: string;
    }
    
    interface TabChangeInfo {
      status?: string;
    }
  }
  
  namespace scripting {
    function executeScript(options: { target: { tabId: number }, files: string[] }): Promise<void>;
  }
}
