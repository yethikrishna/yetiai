
export interface ShareChatTokens {
  session_id: string;
  csrf_token: string;
  user_id: string;
  auth_token: string;
}

export interface ShareChatUser {
  id: string;
  username: string;
  name: string;
  profile_image_url?: string;
  follower_count?: number;
  following_count?: number;
  verified?: boolean;
  language?: string;
}

export interface ShareChatPost {
  id: string;
  text: string;
  user: ShareChatUser;
  created_at: string;
  like_count: number;
  share_count: number;
  comment_count: number;
  is_liked?: boolean;
  is_shared?: boolean;
  language: string;
  media?: Array<{
    type: 'image' | 'video';
    url: string;
    thumbnail_url?: string;
  }>;
  hashtags?: string[];
}

export interface ShareChatComment {
  id: string;
  text: string;
  user: ShareChatUser;
  created_at: string;
  like_count: number;
  is_liked?: boolean;
  replies?: ShareChatComment[];
}

export interface ShareChatCreatePost {
  text: string;
  language: string;
  media_ids?: string[];
  hashtags?: string[];
  parent_id?: string; // For replies
}

export interface ShareChatApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface ShareChatAuthCredentials {
  phone: string;
  password: string;
}

export interface ShareChatSession {
  session_id: string;
  csrf_token: string;
  auth_token: string;
  user_id: string;
  expires_at: string;
}

export interface ShareChatUploadResponse {
  media_id: string;
  media_url: string;
  thumbnail_url?: string;
  media_type: 'image' | 'video';
}
