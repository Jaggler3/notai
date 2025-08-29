import { MessageHandler } from '../message-handler';
import { RedditPostFilter } from '../post-filter';
import { ContentScriptMessage } from '../../types';

// Mock the RedditPostFilter class
jest.mock('../post-filter');

describe('Message Handler', () => {
  let messageHandler: MessageHandler;
  let mockFilter: jest.Mocked<RedditPostFilter>;
  let mockSendResponse: jest.Mock;

  beforeEach(() => {
    mockFilter = {
      setEnabled: jest.fn(),
      setScoreThreshold: jest.fn(),
      filterExistingPosts: jest.fn(),
      showAllPosts: jest.fn(),
      getHiddenPostsCount: jest.fn(),
      isEnabled: jest.fn(),
      getHiddenPostNames: jest.fn(),
      showSpecificPost: jest.fn(),
      refilterPosts: jest.fn(),
    } as any;

    messageHandler = new MessageHandler(mockFilter);
    mockSendResponse = jest.fn();
  });

  describe('handleMessage', () => {
    it('should handle toggleFilter message', () => {
      const message: ContentScriptMessage = {
        action: 'toggleFilter',
        enabled: true
      };

      messageHandler.handleMessage(message, {}, mockSendResponse);

      expect(mockFilter.setEnabled).toHaveBeenCalledWith(true);
      expect(mockFilter.filterExistingPosts).toHaveBeenCalled();
      expect(mockSendResponse).toHaveBeenCalledWith({ success: true });
    });

    it('should handle toggleFilter message when disabled', () => {
      const message: ContentScriptMessage = {
        action: 'toggleFilter',
        enabled: false
      };

      messageHandler.handleMessage(message, {}, mockSendResponse);

      expect(mockFilter.setEnabled).toHaveBeenCalledWith(false);
      expect(mockFilter.showAllPosts).toHaveBeenCalled();
      expect(mockSendResponse).toHaveBeenCalledWith({ success: true });
    });

    it('should handle updateScoreThreshold message', () => {
      const message: ContentScriptMessage = {
        action: 'updateScoreThreshold',
        threshold: 25
      };

      messageHandler.handleMessage(message, {}, mockSendResponse);

      expect(mockFilter.setScoreThreshold).toHaveBeenCalledWith(25);
      expect(mockFilter.refilterPosts).toHaveBeenCalled();
      expect(mockSendResponse).toHaveBeenCalledWith({ success: true });
    });

    it('should handle getStats message', () => {
      mockFilter.getHiddenPostsCount.mockReturnValue(5);
      mockFilter.isEnabled.mockReturnValue(true);

      const message: ContentScriptMessage = {
        action: 'getStats'
      };

      messageHandler.handleMessage(message, {}, mockSendResponse);

      expect(mockFilter.getHiddenPostsCount).toHaveBeenCalled();
      expect(mockFilter.isEnabled).toHaveBeenCalled();
      expect(mockSendResponse).toHaveBeenCalledWith({
        postsHidden: 5,
        isEnabled: true
      });
    });

    it('should handle getHiddenPostNames message', () => {
      const mockHiddenPosts = [
        { id: 'post1', title: 'Post 1', score: 75 },
        { id: 'post2', title: 'Post 2', score: 80 }
      ];
      mockFilter.getHiddenPostNames.mockReturnValue(mockHiddenPosts);

      const message: ContentScriptMessage = {
        action: 'getHiddenPostNames'
      };

      messageHandler.handleMessage(message, {}, mockSendResponse);

      expect(mockFilter.getHiddenPostNames).toHaveBeenCalled();
      expect(mockSendResponse).toHaveBeenCalledWith({
        hiddenPosts: mockHiddenPosts
      });
    });

    it('should handle showSpecificPost message', () => {
      mockFilter.showSpecificPost.mockReturnValue(true);

      const message: ContentScriptMessage = {
        action: 'showSpecificPost',
        postId: 'post123'
      };

      messageHandler.handleMessage(message, {}, mockSendResponse);

      expect(mockFilter.showSpecificPost).toHaveBeenCalledWith('post123');
      expect(mockSendResponse).toHaveBeenCalledWith({ success: true });
    });

    it('should handle showSpecificPost message when post not found', () => {
      mockFilter.showSpecificPost.mockReturnValue(false);

      const message: ContentScriptMessage = {
        action: 'showSpecificPost',
        postId: 'nonexistent'
      };

      messageHandler.handleMessage(message, {}, mockSendResponse);

      expect(mockFilter.showSpecificPost).toHaveBeenCalledWith('nonexistent');
      expect(mockSendResponse).toHaveBeenCalledWith({ success: false });
    });

    it('should handle showAllPosts message', () => {
      const message: ContentScriptMessage = {
        action: 'showAllPosts'
      };

      messageHandler.handleMessage(message, {}, mockSendResponse);

      expect(mockFilter.showAllPosts).toHaveBeenCalled();
      expect(mockSendResponse).toHaveBeenCalledWith({ success: true });
    });

    it('should handle unknown message action', () => {
      const message = {
        action: 'unknownAction'
      } as any;

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      messageHandler.handleMessage(message, {}, mockSendResponse);

      expect(consoleSpy).toHaveBeenCalledWith('Unknown message action:', message);
      expect(mockSendResponse).toHaveBeenCalledWith({ success: false });

      consoleSpy.mockRestore();
    });
  });
});
