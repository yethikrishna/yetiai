
export interface KooTokens {
  session_id: string;
  csrf_token: string;
  user_id: string;
}

export interface KooUser {
  id: string;
  username: string;
  name: string;
  profile_image_url?: string;
  follower_count?: number;
  following_count?: number;
  verified?: boolean;
}

export interface KooPost {
  id: string;
  text: string;
  user: KooUser;
  created_at: string;
  like_count: number;
  rekoo_count: number;
  comment_count: number;
  is_liked?: boolean;
  is_rekooed?: boolean;
  media?: Array<{
    type: 'image' | 'video';
    url: string;
  }>;
}

export interface KooComment {
  id: string;
  text: string;
  user: KooUser;
  created_at: string;
  like_count: number;
  is_liked?: boolean;
}

export interface KooCreatePost {
  text: string;
  media_urls?: string[];
  parent_id?: string; // For replies
}

export interface KooApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface KooAuthCredentials {
  email: string;
  password: string;
}

export interface KooSession {
  session_id: string;
  csrf_token: string;
  user_id: string;
  expires_at: string;
}
