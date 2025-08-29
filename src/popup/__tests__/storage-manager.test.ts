import { StorageManager } from '../storage-manager';
import { StorageData } from '../../types';

describe('Storage Manager', () => {
  let storageManager: StorageManager;

  beforeEach(() => {
    storageManager = new StorageManager();
    jest.clearAllMocks();
  });

  describe('loadState', () => {
    it('should load state successfully', async () => {
      const mockData = {
        filterEnabled: true,
        scoreThreshold: 15
      };

      (chrome.storage.sync.get as jest.Mock).mockResolvedValue(mockData);

      const result = await storageManager.loadState();

      expect(chrome.storage.sync.get).toHaveBeenCalledWith(['filterEnabled', 'scoreThreshold']);
      expect(result).toEqual(mockData);
    });

    it('should handle missing filterEnabled with default true', async () => {
      const mockData = {
        scoreThreshold: 20
      };

      (chrome.storage.sync.get as jest.Mock).mockResolvedValue(mockData);

      const result = await storageManager.loadState();

      expect(result.filterEnabled).toBe(true);
      expect(result.scoreThreshold).toBe(20);
    });

    it('should handle explicit false filterEnabled', async () => {
      const mockData = {
        filterEnabled: false,
        scoreThreshold: 25
      };

      (chrome.storage.sync.get as jest.Mock).mockResolvedValue(mockData);

      const result = await storageManager.loadState();

      expect(result.filterEnabled).toBe(false);
      expect(result.scoreThreshold).toBe(25);
    });

    it('should handle missing scoreThreshold with default 10', async () => {
      const mockData = {
        filterEnabled: true
      };

      (chrome.storage.sync.get as jest.Mock).mockResolvedValue(mockData);

      const result = await storageManager.loadState();

      expect(result.filterEnabled).toBe(true);
      expect(result.scoreThreshold).toBe(10);
    });

    it('should handle storage error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      (chrome.storage.sync.get as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const result = await storageManager.loadState();

      expect(consoleSpy).toHaveBeenCalledWith('Error loading state:', expect.any(Error));
      expect(result.filterEnabled).toBe(true);
      expect(result.scoreThreshold).toBe(10);

      consoleSpy.mockRestore();
    });
  });

  describe('saveState', () => {
    it('should save state successfully', async () => {
      const state: StorageData = {
        filterEnabled: false,
        scoreThreshold: 30
      };

      (chrome.storage.sync.set as jest.Mock).mockResolvedValue(undefined);

      await storageManager.saveState(state);

      expect(chrome.storage.sync.set).toHaveBeenCalledWith(state);
    });

    it('should handle storage error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const state: StorageData = {
        filterEnabled: true,
        scoreThreshold: 25
      };

      (chrome.storage.sync.set as jest.Mock).mockRejectedValue(new Error('Storage error'));

      await storageManager.saveState(state);

      expect(consoleSpy).toHaveBeenCalledWith('Error saving state:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('updateUIFromState', () => {
    it('should update UI elements with state data', async () => {
      // Create mock DOM elements
      document.body.innerHTML = `
        <input id="filterToggle" type="checkbox" />
        <input id="scoreThreshold" type="range" />
        <span id="thresholdValue"></span>
      `;

      const state: StorageData = {
        filterEnabled: false,
        scoreThreshold: 35
      };

      await storageManager.updateUIFromState(state);

      const filterToggle = document.getElementById('filterToggle') as HTMLInputElement;
      const scoreThreshold = document.getElementById('scoreThreshold') as HTMLInputElement;
      const thresholdValue = document.getElementById('thresholdValue');

      expect(filterToggle.checked).toBe(false);
      expect(scoreThreshold.value).toBe('35');
      expect(thresholdValue?.textContent).toBe('35');
    });

    it('should handle missing UI elements gracefully', async () => {
      // No DOM elements
      document.body.innerHTML = '';

      const state: StorageData = {
        filterEnabled: true,
        scoreThreshold: 20
      };

      // Should not throw error
      await expect(storageManager.updateUIFromState(state)).resolves.not.toThrow();
    });

    it('should handle partial UI elements', async () => {
      // Only some DOM elements
      document.body.innerHTML = `
        <input id="filterToggle" type="checkbox" />
        <span id="thresholdValue"></span>
      `;

      const state: StorageData = {
        filterEnabled: false,
        scoreThreshold: 40
      };

      await storageManager.updateUIFromState(state);

      const filterToggle = document.getElementById('filterToggle') as HTMLInputElement;
      const thresholdValue = document.getElementById('thresholdValue');

      expect(filterToggle.checked).toBe(false);
      expect(thresholdValue?.textContent).toBe('40');
    });
  });
});
