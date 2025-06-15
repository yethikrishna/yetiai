
import { KooTokens, KooPost, KooComment, KooCreatePost, KooApiResponse, KooUser } from '@/types/koo';

export class KooApiClient {
  private baseUrl = 'https://www.kooapp.com';
  private tokens: KooTokens | null = null;

  constructor(tokens?: KooTokens) {
    this.tokens = tokens || null;
  }

  setTokens(tokens: KooTokens) {
    this.tokens = tokens;
  }

  private async makeRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<KooApiResponse> {
    if (!this.tokens) {
      throw new Error('Authentication required');
    }

    const headers = {
      'Content-Type': 'application/json',
      'X-CSRFToken': this.tokens.csrf_token,
      'Cookie': `sessionid=${this.tokens.session_id}`,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: response.status.toString(),
            message: `HTTP ${response.status}: ${response.statusText}`,
          },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async getProfile(): Promise<KooApiResponse<KooUser>> {
    if (!this.tokens) {
      return {
        success: false,
        error: { code: 'NO_AUTH', message: 'Authentication required' },
      };
    }

    return this.makeRequest(`/api/profile/${this.tokens.user_id}/`);
  }

  async getTimeline(page = 1, limit = 20): Promise<KooApiResponse<KooPost[]>> {
    return this.makeRequest(`/api/timeline/?page=${page}&limit=${limit}`);
  }

  async getKoo(kooId: string): Promise<KooApiResponse<KooPost>> {
    return this.makeRequest(`/api/koo/${kooId}/`);
  }

  async getKooComments(kooId: string): Promise<KooApiResponse<KooComment[]>> {
    return this.makeRequest(`/api/koo/${kooId}/comments/`);
  }

  async createKoo(kooData: KooCreatePost): Promise<KooApiResponse<KooPost>> {
    return this.makeRequest('/api/koo/create/', {
      method: 'POST',
      body: JSON.stringify(kooData),
    });
  }

  async likeKoo(kooId: string): Promise<KooApiResponse> {
    return this.makeRequest(`/api/koo/${kooId}/like/`, {
      method: 'POST',
    });
  }

  async unlikeKoo(kooId: string): Promise<KooApiResponse> {
    return this.makeRequest(`/api/koo/${kooId}/unlike/`, {
      method: 'POST',
    });
  }

  async rekoo(kooId: string): Promise<KooApiResponse> {
    return this.makeRequest(`/api/koo/${kooId}/rekoo/`, {
      method: 'POST',
    });
  }

  async searchKoos(query: string, page = 1): Promise<KooApiResponse<KooPost[]>> {
    const encodedQuery = encodeURIComponent(query);
    return this.makeRequest(`/api/search/koos/?q=${encodedQuery}&page=${page}`);
  }

  async getUserKoos(userId: string, page = 1): Promise<KooApiResponse<KooPost[]>> {
    return this.makeRequest(`/api/user/${userId}/koos/?page=${page}`);
  }

  async followUser(userId: string): Promise<KooApiResponse> {
    return this.makeRequest(`/api/user/${userId}/follow/`, {
      method: 'POST',
    });
  }

  async unfollowUser(userId: string): Promise<KooApiResponse> {
    return this.makeRequest(`/api/user/${userId}/unfollow/`, {
      method: 'POST',
    });
  }
}
