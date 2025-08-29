import { hasNonFaceEmojis } from '../emoji-detector';

describe('Emoji Detector', () => {
  describe('hasNonFaceEmojis', () => {
    it('should return false for text without emojis', () => {
      expect(hasNonFaceEmojis('Hello world')).toBe(false);
      expect(hasNonFaceEmojis('')).toBe(false);
      expect(hasNonFaceEmojis('123 456')).toBe(false);
    });

    it('should return false for text with only face emojis', () => {
      expect(hasNonFaceEmojis('Hello 😀 world')).toBe(false);
      expect(hasNonFaceEmojis('😊 😂 😍')).toBe(false);
      expect(hasNonFaceEmojis('🤔 🤨 😏')).toBe(false);
    });

    it('should return true for text with non-face emojis', () => {
      expect(hasNonFaceEmojis('Hello 🚀 world')).toBe(true);
      expect(hasNonFaceEmojis('🎉 🎊 🎈')).toBe(true);
      expect(hasNonFaceEmojis('🍕 🍔 🍟')).toBe(true);
      expect(hasNonFaceEmojis('⚽ 🏀 🏈')).toBe(true);
      expect(hasNonFaceEmojis('🌍 🌎 🌏')).toBe(true);
    });

    it('should return true for mixed emojis with non-face ones', () => {
      expect(hasNonFaceEmojis('Hello 😀 🚀 world')).toBe(true);
      expect(hasNonFaceEmojis('😊 🎉 😍')).toBe(true);
      expect(hasNonFaceEmojis('🤔 🍕 😏')).toBe(true);
    });

    it('should handle complex emoji sequences', () => {
      expect(hasNonFaceEmojis('🚀🚀🚀')).toBe(true);
      expect(hasNonFaceEmojis('😀🚀😀')).toBe(true);
      expect(hasNonFaceEmojis('🎉🎊🎈🎁')).toBe(true);
    });

    it('should handle edge cases', () => {
      expect(hasNonFaceEmojis('🚀')).toBe(true);
      expect(hasNonFaceEmojis('😀')).toBe(false);
      expect(hasNonFaceEmojis('🚀😀')).toBe(true);
      expect(hasNonFaceEmojis('😀🚀')).toBe(true);
    });
  });
});
