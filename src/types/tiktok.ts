
export interface TikTokTokens {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope: string;
  token_type: string;
  open_id: string;
}

export interface TikTokCreatorInfo {
  creator_avatar_url?: string;
  creator_nickname?: string;
  creator_username?: string;
  privacy_level_options?: string[];
  comment_disabled?: boolean;
  duet_disabled?: boolean;
  stitch_disabled?: boolean;
  max_video_post_duration_sec?: number;
}

export interface TikTokPostInfo {
  privacy_level: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'FOLLOWER_OF_CREATOR' | 'SELF_ONLY';
  title: string;
  disable_comment?: boolean;
  disable_duet?: boolean;
  disable_stitch?: boolean;
  brand_content_toggle?: boolean;
  brand_organic_toggle?: boolean;
}

export interface TikTokSourceInfo {
  source: 'FILE_UPLOAD' | 'PULL_FROM_URL';
  video_size?: number;
  chunk_size?: number;
  total_chunk_count?: number;
  video_url?: string;
}

export interface TikTokVideoInit {
  post_info: TikTokPostInfo;
  source_info: TikTokSourceInfo;
}

export interface TikTokVideoInitResponse {
  data: {
    publish_id: string;
    upload_url?: string;
  };
  error?: {
    code: string;
    message: string;
    log_id: string;
  };
}

export interface TikTokPublishStatus {
  publish_id: string;
  status: 'PROCESSING_UPLOAD' | 'PROCESSING_DOWNLOAD' | 'PUBLISH_COMPLETE' | 'FAILED' | 'UPLOADED';
  fail_reason?: string;
}

export interface TikTokApiResponse {
  data?: any;
  error?: {
    code: string;
    message: string;
    log_id: string;
  };
}

export interface TikTokPhotoInit {
  post_info: TikTokPostInfo;
  source_info: {
    source: 'FILE_UPLOAD' | 'PULL_FROM_URL';
    photo_images: Array<{
      image_url?: string;
      image_size?: number;
    }>;
  };
  media_type: 'PHOTO';
  post_mode: 'DIRECT_POST' | 'MEDIA_UPLOAD';
}
