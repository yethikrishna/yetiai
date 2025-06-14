
import { TikTokTokens, TikTokVideoInit, TikTokVideoInitResponse, TikTokPublishStatus, TikTokCreatorInfo, TikTokPhotoInit } from '@/types/tiktok';

export class TikTokApiClient {
  private baseUrl = 'https://open.tiktokapis.com/v2';
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`TikTok API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getCreatorInfo(): Promise<TikTokCreatorInfo> {
    console.log('Fetching TikTok creator info...');
    return this.makeRequest('/post/publish/creator_info/query/', {
      method: 'POST',
    });
  }

  async initVideoPost(videoInit: TikTokVideoInit): Promise<TikTokVideoInitResponse> {
    console.log('Initializing TikTok video post...', videoInit);
    return this.makeRequest('/post/publish/video/init/', {
      method: 'POST',
      body: JSON.stringify(videoInit),
    });
  }

  async initInboxVideo(videoInit: Omit<TikTokVideoInit, 'post_info'>): Promise<TikTokVideoInitResponse> {
    console.log('Initializing TikTok inbox video...', videoInit);
    return this.makeRequest('/post/publish/inbox/video/init/', {
      method: 'POST',
      body: JSON.stringify(videoInit),
    });
  }

  async initPhotoPost(photoInit: TikTokPhotoInit): Promise<TikTokVideoInitResponse> {
    console.log('Initializing TikTok photo post...', photoInit);
    return this.makeRequest('/post/publish/content/init/', {
      method: 'POST',
      body: JSON.stringify(photoInit),
    });
  }

  async uploadVideo(uploadUrl: string, videoData: ArrayBuffer | Blob, contentRange?: string): Promise<Response> {
    console.log('Uploading video to TikTok...', { uploadUrl, size: videoData instanceof ArrayBuffer ? videoData.byteLength : videoData.size });
    
    const headers: Record<string, string> = {
      'Content-Type': 'video/mp4',
    };

    if (contentRange) {
      headers['Content-Range'] = contentRange;
    }

    return fetch(uploadUrl, {
      method: 'PUT',
      headers,
      body: videoData,
    });
  }

  async getPublishStatus(publishId: string): Promise<TikTokPublishStatus> {
    console.log('Checking TikTok publish status...', publishId);
    return this.makeRequest('/post/publish/status/fetch/', {
      method: 'POST',
      body: JSON.stringify({ publish_id: publishId }),
    });
  }

  async getUserInfo(): Promise<any> {
    console.log('Fetching TikTok user info...');
    return this.makeRequest('/user/info/', {
      method: 'POST',
      body: JSON.stringify({
        fields: ['open_id', 'union_id', 'avatar_url', 'display_name', 'username']
      }),
    });
  }

  async getVideos(cursor?: string, max_count: number = 20): Promise<any> {
    console.log('Fetching TikTok videos...', { cursor, max_count });
    const body: any = {
      max_count,
      fields: ['id', 'title', 'video_description', 'duration', 'create_time', 'share_url']
    };

    if (cursor) {
      body.cursor = cursor;
    }

    return this.makeRequest('/video/list/', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
}
