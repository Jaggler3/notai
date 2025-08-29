import { RedditPostFilter } from './content/post-filter';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new RedditPostFilter();
  });
} else {
  new RedditPostFilter();
}
