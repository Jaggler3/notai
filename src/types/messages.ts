export interface FilterToggleMessage {
  action: 'toggleFilter';
  enabled: boolean;
}

export interface ScoreThresholdMessage {
  action: 'updateScoreThreshold';
  threshold: number;
}

export interface GetStatsMessage {
  action: 'getStats';
}

export interface GetHiddenPostNamesMessage {
  action: 'getHiddenPostNames';
}

export interface ShowSpecificPostMessage {
  action: 'showSpecificPost';
  postId: string;
}

export interface ShowAllPostsMessage {
  action: 'showAllPosts';
}

export interface PostFilteredMessage {
  action: 'postFiltered';
  postsHidden: number;
}

export interface StatsResponse {
  postsHidden: number;
  isEnabled: boolean;
}

export interface HiddenPostsResponse {
  hiddenPosts: Array<{
    id: string;
    title: string;
    score: number;
  }>;
}

export interface SuccessResponse {
  success: boolean;
}

export type ContentScriptMessage = 
  | FilterToggleMessage
  | ScoreThresholdMessage
  | GetStatsMessage
  | GetHiddenPostNamesMessage
  | ShowSpecificPostMessage
  | ShowAllPostsMessage;

export type PopupMessage = PostFilteredMessage;
