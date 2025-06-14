
import { TwitterApiResponse, TwitterTokens } from '@/types/twitter';

class TwitterApiClient {
  async makeApiRequest(
    endpoint: string, 
    method: 'GET' | 'POST' | 'DELETE', 
    accessToken: string, 
    body?: any
  ): Promise<TwitterApiResponse> {
    const url = `https://api.twitter.com${endpoint}`;
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };

    const config: RequestInit = {
      method,
      headers
    };

    if (body && method === 'POST') {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      console.error('Twitter API Error:', data);
      throw new Error(data.detail || data.title || 'Twitter API request failed');
    }

    return data;
  }

  async postTweet(text: string, accessToken: string, mediaIds?: string[]): Promise<TwitterApiResponse> {
    const payload: any = { text };
    if (mediaIds && mediaIds.length > 0) {
      payload.media = { media_ids: mediaIds };
    }

    return this.makeApiRequest('/2/tweets', 'POST', accessToken, payload);
  }

  async getUserTweets(userId: string, accessToken: string, maxResults: number = 10): Promise<TwitterApiResponse> {
    const params = new URLSearchParams({
      max_results: maxResults.toString(),
      'tweet.fields': 'created_at,author_id,public_metrics'
    });

    return this.makeApiRequest(`/2/users/${userId}/tweets?${params}`, 'GET', accessToken);
  }

  async searchTweets(query: string, accessToken: string, maxResults: number = 10): Promise<TwitterApiResponse> {
    const params = new URLSearchParams({
      query: query,
      max_results: maxResults.toString(),
      'tweet.fields': 'created_at,author_id,public_metrics'
    });

    return this.makeApiRequest(`/2/tweets/search/recent?${params}`, 'GET', accessToken);
  }

  async followUser(targetUserId: string, accessToken: string): Promise<TwitterApiResponse> {
    // First get current user ID
    const userResponse = await this.makeApiRequest('/2/users/me', 'GET', accessToken);
    if (!userResponse.data) throw new Error('Could not get current user');

    const sourceUserId = userResponse.data.id;
    const payload = { target_user_id: targetUserId };

    return this.makeApiRequest(`/2/users/${sourceUserId}/following`, 'POST', accessToken, payload);
  }

  async unfollowUser(targetUserId: string, accessToken: string): Promise<TwitterApiResponse> {
    // First get current user ID
    const userResponse = await this.makeApiRequest('/2/users/me', 'GET', accessToken);
    if (!userResponse.data) throw new Error('Could not get current user');

    const sourceUserId = userResponse.data.id;

    return this.makeApiRequest(`/2/users/${sourceUserId}/following/${targetUserId}`, 'DELETE', accessToken);
  }

  async getUserByUsername(username: string, accessToken: string): Promise<TwitterApiResponse> {
    return this.makeApiRequest(`/2/users/by/username/${username}`, 'GET', accessToken);
  }

  async getCurrentUser(accessToken: string): Promise<TwitterApiResponse> {
    return this.makeApiRequest('/2/users/me', 'GET', accessToken);
  }
}

export const twitterApiClient = new TwitterApiClient();
