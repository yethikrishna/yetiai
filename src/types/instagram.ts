
export interface InstagramTokens {
  access_token: string;
  expires_in?: number;
  token_type: string;
}

export interface InstagramPageToken {
  access_token: string;
  id: string;
  name: string;
  instagram_business_account?: {
    id: string;
  };
}

export interface InstagramApiResponse {
  data?: any;
  error?: {
    message: string;
    type: string;
    code: number;
    error_subcode?: number;
  };
  paging?: {
    cursors?: {
      before: string;
      after: string;
    };
    next?: string;
    previous?: string;
  };
}

export interface InstagramPost {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  timestamp: string;
  permalink?: string;
  like_count?: number;
  comments_count?: number;
}

export interface InstagramMediaContainer {
  id: string;
  status?: string;
}

export interface InstagramAccount {
  id: string;
  username: string;
  account_type: 'BUSINESS' | 'MEDIA_CREATOR';
  media_count?: number;
  followers_count?: number;
  follows_count?: number;
}
