
import { LinkedInTokens, LinkedInProfile, LinkedInEmail, LinkedInPost, LinkedInApiResponse, LinkedInOrganization } from '@/types/linkedin';

export class LinkedInApiClient {
  private accessToken: string;
  private baseUrl = 'https://api.linkedin.com/v2';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`LinkedIn API Error: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  async getProfile(): Promise<LinkedInProfile> {
    return this.request<LinkedInProfile>('/me');
  }

  async getEmail(): Promise<LinkedInEmail> {
    return this.request<LinkedInEmail>('/emailAddress?q=members&projection=(elements*(handle~))');
  }

  async sharePost(post: Omit<LinkedInPost, 'author'>): Promise<LinkedInApiResponse> {
    // First get the user's profile to get their URN
    const profile = await this.getProfile();
    
    const fullPost: LinkedInPost = {
      ...post,
      author: `urn:li:person:${profile.id}`,
    };

    return this.request<LinkedInApiResponse>('/ugcPosts', {
      method: 'POST',
      body: JSON.stringify(fullPost),
    });
  }

  async searchOrganizations(vanityName: string): Promise<LinkedInOrganization[]> {
    const response = await this.request<{ elements: LinkedInOrganization[] }>(
      `/organizations?q=vanityName&vanityName=${encodeURIComponent(vanityName)}`
    );
    return response.elements || [];
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getProfile();
      return true;
    } catch (error) {
      console.error('LinkedIn connection test failed:', error);
      return false;
    }
  }
}
