import { PopupManager } from './popup/popup-manager';

document.addEventListener('DOMContentLoaded', async () => {
  const popupManager = new PopupManager();
  await popupManager.init();
  
  window.addEventListener('beforeunload', () => {
    popupManager.destroy();
  });
});
