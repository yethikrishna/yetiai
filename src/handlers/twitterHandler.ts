
import { ConnectionConfig } from '@/types/platform';

export interface TwitterTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
}

export interface TwitterApiResponse {
  data?: any;
  errors?: Array<{ message: string; code: number }>;
  meta?: any;
}

class TwitterHandler {
  private clientId: string = '';
  private clientSecret: string = '';
  private redirectUri: string = `${window.location.origin}/auth/twitter/callback`;
  
  async connect(credentials: Record<string, string>): Promise<boolean> {
    console.log('Starting Twitter OAuth connection...');
    
    // For Twitter, we need to handle OAuth 2.0 flow
    if (credentials.clientId && credentials.clientSecret) {
      this.clientId = credentials.clientId;
      this.clientSecret = credentials.clientSecret;
      
      // Start OAuth flow
      this.initiateOAuthFlow();
      return true;
    }
    
    throw new Error('Twitter Client ID and Client Secret are required');
  }

  private initiateOAuthFlow(): void {
    const scopes = [
      'tweet.read',
      'tweet.write', 
      'users.read',
      'follows.read',
      'follows.write',
      'offline.access'
    ].join(' ');

    const state = this.generateRandomString(32);
    const codeChallenge = this.generateRandomString(128);
    
    // Store state and code challenge for verification
    localStorage.setItem('twitter_oauth_state', state);
    localStorage.setItem('twitter_code_challenge', codeChallenge);

    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scopes,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'plain'
    });

    const authUrl = `https://twitter.com/i/oauth2/authorize?${authParams.toString()}`;
    window.location.href = authUrl;
  }

  async handleOAuthCallback(code: string, state: string): Promise<TwitterTokens> {
    const storedState = localStorage.getItem('twitter_oauth_state');
    const codeChallenge = localStorage.getItem('twitter_code_challenge');

    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    const tokenData = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      code_verifier: codeChallenge
    };

    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
      },
      body: new URLSearchParams(tokenData)
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const tokens: TwitterTokens = await response.json();
    
    // Clean up stored values
    localStorage.removeItem('twitter_oauth_state');
    localStorage.removeItem('twitter_code_challenge');
    
    // Store tokens securely
    localStorage.setItem('twitter_tokens', JSON.stringify(tokens));
    
    return tokens;
  }

  async disconnect(connection: ConnectionConfig): Promise<void> {
    console.log('Disconnecting from Twitter...');
    
    // Clear stored tokens
    localStorage.removeItem('twitter_tokens');
    
    // In a production app, you might also want to revoke the token
    // by calling Twitter's revoke endpoint
  }

  async test(connection: ConnectionConfig): Promise<boolean> {
    try {
      const tokens = this.getStoredTokens();
      if (!tokens) return false;

      // Test connection by fetching user profile
      const response = await this.makeApiRequest('/2/users/me', 'GET', tokens.access_token);
      return response.data != null;
    } catch (error) {
      console.error('Twitter connection test failed:', error);
      return false;
    }
  }

  // Twitter API Methods
  async postTweet(text: string, mediaIds?: string[]): Promise<TwitterApiResponse> {
    const tokens = this.getStoredTokens();
    if (!tokens) throw new Error('Not authenticated with Twitter');

    const payload: any = { text };
    if (mediaIds && mediaIds.length > 0) {
      payload.media = { media_ids: mediaIds };
    }

    return this.makeApiRequest('/2/tweets', 'POST', tokens.access_token, payload);
  }

  async getUserTweets(userId: string, maxResults: number = 10): Promise<TwitterApiResponse> {
    const tokens = this.getStoredTokens();
    if (!tokens) throw new Error('Not authenticated with Twitter');

    const params = new URLSearchParams({
      max_results: maxResults.toString(),
      'tweet.fields': 'created_at,author_id,public_metrics'
    });

    return this.makeApiRequest(`/2/users/${userId}/tweets?${params}`, 'GET', tokens.access_token);
  }

  async searchTweets(query: string, maxResults: number = 10): Promise<TwitterApiResponse> {
    const tokens = this.getStoredTokens();
    if (!tokens) throw new Error('Not authenticated with Twitter');

    const params = new URLSearchParams({
      query: query,
      max_results: maxResults.toString(),
      'tweet.fields': 'created_at,author_id,public_metrics'
    });

    return this.makeApiRequest(`/2/tweets/search/recent?${params}`, 'GET', tokens.access_token);
  }

  async followUser(targetUserId: string): Promise<TwitterApiResponse> {
    const tokens = this.getStoredTokens();
    if (!tokens) throw new Error('Not authenticated with Twitter');

    // First get current user ID
    const userResponse = await this.makeApiRequest('/2/users/me', 'GET', tokens.access_token);
    if (!userResponse.data) throw new Error('Could not get current user');

    const sourceUserId = userResponse.data.id;
    const payload = { target_user_id: targetUserId };

    return this.makeApiRequest(`/2/users/${sourceUserId}/following`, 'POST', tokens.access_token, payload);
  }

  async unfollowUser(targetUserId: string): Promise<TwitterApiResponse> {
    const tokens = this.getStoredTokens();
    if (!tokens) throw new Error('Not authenticated with Twitter');

    // First get current user ID
    const userResponse = await this.makeApiRequest('/2/users/me', 'GET', tokens.access_token);
    if (!userResponse.data) throw new Error('Could not get current user');

    const sourceUserId = userResponse.data.id;

    return this.makeApiRequest(`/2/users/${sourceUserId}/following/${targetUserId}`, 'DELETE', tokens.access_token);
  }

  async getUserByUsername(username: string): Promise<TwitterApiResponse> {
    const tokens = this.getStoredTokens();
    if (!tokens) throw new Error('Not authenticated with Twitter');

    return this.makeApiRequest(`/2/users/by/username/${username}`, 'GET', tokens.access_token);
  }

  // Helper methods
  private async makeApiRequest(
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

  private getStoredTokens(): TwitterTokens | null {
    try {
      const stored = localStorage.getItem('twitter_tokens');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading stored Twitter tokens:', error);
      return null;
    }
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const twitterHandler = new TwitterHandler();
