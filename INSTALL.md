# Quick Installation Guide

## Install the Extension

1. **Download the extension files** to a folder on your computer
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer mode** (toggle in the top right corner)
4. **Click "Load unpacked"** and select the extension folder
5. **Pin the extension** to your toolbar for easy access

## Test the Extension

1. **Go to Reddit** (e.g., `https://reddit.com/r/all`)
2. **The extension automatically starts working** - no setup required!
3. **Look for filtered posts** - posts with em dashes (—) or colons (:) in their titles will be replaced with "[filtered]" placeholders
4. **Click the extension icon** to see statistics and manage settings

## How It Works

- **Automatic Filtering**: The extension scans Reddit pages for posts with `<article>` tags
- **Smart Detection**: Looks for posts with em dashes (—) or colons (:) in their `aria-label` attributes
- **Clean Placeholders**: Replaces filtered posts with "[filtered]" placeholders that include Show buttons
- **Real-time Updates**: New posts are filtered automatically as you scroll
- **Easy Restoration**: Click "Show" on any placeholder to reveal the original post

## What Gets Filtered

The extension automatically filters Reddit posts containing:
- **Em dashes (—)**: Often used in clickbait titles
- **Colons (:)** : Commonly used in listicle titles

Examples of filtered titles:
- "This Post — You Won't Believe What Happens Next"
- "10 Things: The Ultimate Guide"
- "Breaking News: Latest Updates"

## Managing Filtered Posts

- **Show Individual Post**: Click the "Show" button on any "[filtered]" placeholder
- **Show All Posts**: Use the "Show All Posts" button in the popup
- **Toggle Filter**: Enable/disable filtering without losing your placeholders
- **View Statistics**: See how many posts are currently hidden

## Troubleshooting

- **Extension not working?** Make sure you're on a Reddit page and refresh after enabling
- **Posts not being filtered?** Check that the filter is enabled (toggle should be green)
- **Need help?** Check the main README.md file for detailed documentation

## Next Steps

- The extension works automatically - no configuration needed!
- Customize the filtering criteria by modifying the `shouldFilter` function in `content.js`
- Add new patterns or characters to filter out different types of posts
- Share feedback and suggestions for improvements
