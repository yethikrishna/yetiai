
import { TikTokTokens, TikTokVideoInit, TikTokVideoInitResponse, TikTokPublishStatus, TikTokCreatorInfo, TikTokPhotoInit, TikTokApiErrorResponse } from '@/types/tiktok';

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
      const errorBody: TikTokApiErrorResponse | null = await response.json().catch(() => null);
      const logIdFromHeaders = response.headers.get('x-tt-logid') || response.headers.get('X-Tt-Logid') || 'N/A';

      if (errorBody && errorBody.error && errorBody.error.code && errorBody.error.message) {
        const errorMessage = `TikTok API Error (${response.status}): [Code: ${errorBody.error.code}] ${errorBody.error.message} (Log ID: ${errorBody.error.log_id || logIdFromHeaders})`;
        console.error(errorMessage, errorBody);
        throw new Error(errorMessage);
      } else if (errorBody && errorBody.data && errorBody.data.error_code && errorBody.data.description) {
        // Handling cases where error is nested under 'data' (less common for primary error but good to check)
        const errorMessage = `TikTok API Error (${response.status}): [Code: ${errorBody.data.error_code}] ${errorBody.data.description} (Log ID: ${errorBody.data.log_id || logIdFromHeaders})`;
        console.error(errorMessage, errorBody);
        throw new Error(errorMessage);
      } else {
        const errorText = await response.text().catch(() => 'Could not retrieve error text.');
        const errorMessage = `TikTok API error: ${response.status} ${response.statusText || errorText} (Log ID: ${logIdFromHeaders})`;
        console.error(errorMessage, { status: response.status, statusText: response.statusText, body: errorText });
        throw new Error(errorMessage);
      }
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

  async checkResearchApiStatus(): Promise<any> {
    console.log('Checking TikTok Research API status...');
    // IMPORTANT: '/research/api/health/' is a hypothetical endpoint.
    // Replace with a real Research API endpoint if known and available
    // for a simple status check or basic query that uses client credentials.
    // For now, this demonstrates the flow.
    return this.makeRequest('/research/api/health/', {
      method: 'GET' // Or POST, depending on the actual API
    });
  }
}
