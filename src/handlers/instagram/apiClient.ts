
import { InstagramApiResponse, InstagramPost, InstagramAccount, InstagramMediaContainer } from '@/types/instagram';

export class InstagramApiClient {
  private baseUrl = 'https://graph.facebook.com/v18.0';
  private pageAccessToken: string;
  private instagramAccountId: string;

  constructor(pageAccessToken: string, instagramAccountId: string) {
    this.pageAccessToken = pageAccessToken;
    this.instagramAccountId = instagramAccountId;
  }

  private async makeRequest(endpoint: string, options?: RequestInit): Promise<InstagramApiResponse> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`Instagram API request to: ${url}`);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Instagram API error:', data);
        return { error: data.error || { message: 'Unknown error', type: 'api_error', code: response.status } };
      }

      return { data };
    } catch (error) {
      console.error('Instagram API request failed:', error);
      return { 
        error: { 
          message: error instanceof Error ? error.message : 'Network error', 
          type: 'network_error', 
          code: 0 
        } 
      };
    }
  }

  async getAccountInfo(): Promise<InstagramAccount | null> {
    const response = await this.makeRequest(
      `/${this.instagramAccountId}?fields=id,username,account_type,media_count,followers_count,follows_count&access_token=${this.pageAccessToken}`
    );

    if (response.error) {
      throw new Error(`Failed to get account info: ${response.error.message}`);
    }

    return response.data;
  }

  async getPosts(limit: number = 10): Promise<InstagramPost[]> {
    const response = await this.makeRequest(
      `/${this.instagramAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,permalink,like_count,comments_count&limit=${limit}&access_token=${this.pageAccessToken}`
    );

    if (response.error) {
      throw new Error(`Failed to get posts: ${response.error.message}`);
    }

    return response.data?.data || [];
  }

  async createMediaContainer(imageUrl: string, caption?: string): Promise<InstagramMediaContainer> {
    const params = new URLSearchParams({
      image_url: imageUrl,
      access_token: this.pageAccessToken,
    });

    if (caption) {
      params.append('caption', caption);
    }

    const response = await this.makeRequest(
      `/${this.instagramAccountId}/media`,
      {
        method: 'POST',
        body: params,
      }
    );

    if (response.error) {
      throw new Error(`Failed to create media container: ${response.error.message}`);
    }

    return response.data;
  }

  async publishMedia(containerId: string): Promise<{ id: string }> {
    const params = new URLSearchParams({
      creation_id: containerId,
      access_token: this.pageAccessToken,
    });

    const response = await this.makeRequest(
      `/${this.instagramAccountId}/media_publish`,
      {
        method: 'POST',
        body: params,
      }
    );

    if (response.error) {
      throw new Error(`Failed to publish media: ${response.error.message}`);
    }

    return response.data;
  }

  async createCarouselPost(imageUrls: string[], caption?: string): Promise<{ id: string }> {
    // Step 1: Create child media containers
    const childIds: string[] = [];
    
    for (const imageUrl of imageUrls) {
      const params = new URLSearchParams({
        image_url: imageUrl,
        is_carousel_item: 'true',
        access_token: this.pageAccessToken,
      });

      const response = await this.makeRequest(
        `/${this.instagramAccountId}/media`,
        {
          method: 'POST',
          body: params,
        }
      );

      if (response.error) {
        throw new Error(`Failed to create carousel child: ${response.error.message}`);
      }

      childIds.push(response.data.id);
    }

    // Step 2: Create carousel container
    const carouselParams = new URLSearchParams({
      media_type: 'CAROUSEL',
      children: childIds.join(','),
      access_token: this.pageAccessToken,
    });

    if (caption) {
      carouselParams.append('caption', caption);
    }

    const carouselResponse = await this.makeRequest(
      `/${this.instagramAccountId}/media`,
      {
        method: 'POST',
        body: carouselParams,
      }
    );

    if (carouselResponse.error) {
      throw new Error(`Failed to create carousel container: ${carouselResponse.error.message}`);
    }

    // Step 3: Publish carousel
    return this.publishMedia(carouselResponse.data.id);
  }

  async testConnection(): Promise<boolean> {
    try {
      const account = await this.getAccountInfo();
      return !!account;
    } catch (error) {
      console.error('Instagram connection test failed:', error);
      return false;
    }
  }
}
