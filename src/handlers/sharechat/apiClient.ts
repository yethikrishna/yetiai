
import { 
  ShareChatApiResponse, 
  ShareChatPost, 
  ShareChatComment, 
  ShareChatCreatePost,
  ShareChatUploadResponse,
  ShareChatUser 
} from '@/types/sharechat';

export class ShareChatApiClient {
  private baseUrl = 'https://sharechat.com';
  private apiBaseUrl = 'https://sharechat.com/api/v2';
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private getHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'User-Agent': 'ShareChat/1.0 (Web)',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9,hi;q=0.8',
    };
  }

  // Read Operations
  async getFeed(page: number = 1, limit: number = 20): Promise<ShareChatApiResponse<ShareChatPost[]>> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/feed?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.posts || []
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_FEED_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  async getPost(postId: string): Promise<ShareChatApiResponse<ShareChatPost>> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/post/${postId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.post
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_POST_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  async getComments(postId: string, page: number = 1): Promise<ShareChatApiResponse<ShareChatComment[]>> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/post/${postId}/comments?page=${page}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.comments || []
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_COMMENTS_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  async searchPosts(query: string, language?: string): Promise<ShareChatApiResponse<ShareChatPost[]>> {
    try {
      const params = new URLSearchParams({
        q: query,
        ...(language && { lang: language })
      });

      const response = await fetch(`${this.apiBaseUrl}/search/posts?${params}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.posts || []
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SEARCH_POSTS_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // Write Operations
  async createPost(postData: ShareChatCreatePost): Promise<ShareChatApiResponse<ShareChatPost>> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/post/create`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          text: postData.text,
          language: postData.language,
          media_ids: postData.media_ids || [],
          hashtags: postData.hashtags || [],
          parent_id: postData.parent_id
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.post
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'CREATE_POST_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  async likePost(postId: string): Promise<ShareChatApiResponse<boolean>> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/post/${postId}/like`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'LIKE_POST_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  async commentOnPost(postId: string, text: string): Promise<ShareChatApiResponse<ShareChatComment>> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/post/${postId}/comment`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.comment
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'COMMENT_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // Upload Operations
  async uploadMedia(file: File): Promise<ShareChatApiResponse<ShareChatUploadResponse>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', file.type.startsWith('video/') ? 'video' : 'image');

      const response = await fetch(`${this.apiBaseUrl}/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'User-Agent': 'ShareChat/1.0 (Web)',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: {
          media_id: data.media_id,
          media_url: data.media_url,
          thumbnail_url: data.thumbnail_url,
          media_type: data.media_type
        }
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'UPLOAD_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  // User Operations
  async getCurrentUser(): Promise<ShareChatApiResponse<ShareChatUser>> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/me`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data.user
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GET_USER_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  async followUser(userId: string): Promise<ShareChatApiResponse<boolean>> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/user/${userId}/follow`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        success: true,
        data: true
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FOLLOW_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
}
