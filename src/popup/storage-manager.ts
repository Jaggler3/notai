import { StorageData, StorageResult } from '../types';

export class StorageManager {
  async loadState(): Promise<StorageData> {
    try {
      const result: StorageResult = await chrome.storage.sync.get(['filterEnabled', 'scoreThreshold']);
      return {
        filterEnabled: result.filterEnabled !== false,
        scoreThreshold: result.scoreThreshold || 10
      };
    } catch (error) {
      console.error('Error loading state:', error);
      return {
        filterEnabled: true,
        scoreThreshold: 10
      };
    }
  }

  async saveState(data: StorageData): Promise<void> {
    try {
      await chrome.storage.sync.set({
        filterEnabled: data.filterEnabled,
        scoreThreshold: data.scoreThreshold
      });
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }

  async updateUIFromState(data: StorageData): Promise<void> {
    const filterToggle = document.getElementById('filterToggle') as HTMLInputElement;
    const scoreThreshold = document.getElementById('scoreThreshold') as HTMLInputElement;
    const thresholdValue = document.getElementById('thresholdValue');
    
    if (filterToggle) filterToggle.checked = data.filterEnabled;
    if (scoreThreshold) scoreThreshold.value = data.scoreThreshold.toString();
    if (thresholdValue) thresholdValue.textContent = data.scoreThreshold.toString();
  }
}
