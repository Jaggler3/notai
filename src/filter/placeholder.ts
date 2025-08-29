import { PostData } from '../types';

export function createPlaceholder(article: HTMLElement, postId: string, score: number, onShowPost: (postId: string) => void): HTMLElement {
  const placeholder = document.createElement('article');
  placeholder.className = 'w-full m-0 reddit-filter-placeholder';
  placeholder.setAttribute('data-filtered-post-id', postId);
  placeholder.style.cssText = `
    padding: 0 16px;
    margin: 8px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  `;
  
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
  
  filteredText.addEventListener('mouseenter', () => {
    filteredText.style.opacity = '1';
  });
  
  filteredText.addEventListener('mouseleave', () => {
    filteredText.style.opacity = '0.75';
  });
  
  filteredText.addEventListener('click', () => {
    onShowPost(postId);
  });
  
  placeholder.appendChild(filteredText);
  
  return placeholder;
}

export function removePlaceholder(placeholder: HTMLElement): void {
  if (placeholder && placeholder.parentNode) {
    placeholder.parentNode.removeChild(placeholder);
  }
}
