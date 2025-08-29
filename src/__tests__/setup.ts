// Mock Chrome API for testing
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
    sendMessage: jest.fn(),
  },
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn(),
    },
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn(),
    reload: jest.fn(),
  },
} as any;

// Mock DOM elements that might not exist in jsdom
Object.defineProperty(document, 'readyState', {
  value: 'complete',
  writable: true,
});

// Mock MutationObserver
global.MutationObserver = class {
  constructor(callback: any) {}
  observe() {}
  disconnect() {}
} as any;

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Add a simple test to satisfy Jest
describe('Setup', () => {
  it('should have chrome mock defined', () => {
    expect(global.chrome).toBeDefined();
    expect(global.chrome.runtime).toBeDefined();
    expect(global.chrome.storage).toBeDefined();
  });
});
