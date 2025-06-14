
import { ConnectionConfig } from '@/types/platform';
import { TwitterApiResponse } from '@/types/twitter';
import { twitterOAuthHandler } from './oauthHandler';
import { twitterApiClient } from './apiClient';

class TwitterHandler {
  async connect(credentials: Record<string, string>): Promise<boolean> {
    console.log('Starting Twitter OAuth connection...');
    
    // For Twitter, we need to handle OAuth 2.0 flow
    if (credentials.clientId && credentials.clientSecret) {
      twitterOAuthHandler.setCredentials(credentials.clientId, credentials.clientSecret);
      
      // Start OAuth flow
      twitterOAuthHandler.initiateOAuthFlow();
      return true;
    }
    
    throw new Error('Twitter Client ID and Client Secret are required');
  }

  async handleOAuthCallback(code: string, state: string) {
    return twitterOAuthHandler.handleOAuthCallback(code, state);
  }

  async disconnect(connection: ConnectionConfig): Promise<void> {
    console.log('Disconnecting from Twitter...');
    
    // Clear stored tokens
    twitterOAuthHandler.clearStoredTokens();
    
    // In a production app, you might also want to revoke the token
    // by calling Twitter's revoke endpoint
  }

  async test(connection: ConnectionConfig): Promise<boolean> {
    try {
      const tokens = twitterOAuthHandler.getStoredTokens();
      if (!tokens) return false;

      // Test connection by fetching user profile
      const response = await twitterApiClient.getCurrentUser(tokens.access_token);
      return response.data != null;
    } catch (error) {
      console.error('Twitter connection test failed:', error);
      return false;
    }
  }

  // Twitter API Methods
  async postTweet(text: string, mediaIds?: string[]): Promise<TwitterApiResponse> {
    const tokens = twitterOAuthHandler.getStoredTokens();
    if (!tokens) throw new Error('Not authenticated with Twitter');

    return twitterApiClient.postTweet(text, tokens.access_token, mediaIds);
  }

  async getUserTweets(userId: string, maxResults: number = 10): Promise<TwitterApiResponse> {
    const tokens = twitterOAuthHandler.getStoredTokens();
    if (!tokens) throw new Error('Not authenticated with Twitter');

    return twitterApiClient.getUserTweets(userId, tokens.access_token, maxResults);
  }

  async searchTweets(query: string, maxResults: number = 10): Promise<TwitterApiResponse> {
    const tokens = twitterOAuthHandler.getStoredTokens();
    if (!tokens) throw new Error('Not authenticated with Twitter');

    return twitterApiClient.searchTweets(query, tokens.access_token, maxResults);
  }

  async followUser(targetUserId: string): Promise<TwitterApiResponse> {
    const tokens = twitterOAuthHandler.getStoredTokens();
    if (!tokens) throw new Error('Not authenticated with Twitter');

    return twitterApiClient.followUser(targetUserId, tokens.access_token);
  }

  async unfollowUser(targetUserId: string): Promise<TwitterApiResponse> {
    const tokens = twitterOAuthHandler.getStoredTokens();
    if (!tokens) throw new Error('Not authenticated with Twitter');

    return twitterApiClient.unfollowUser(targetUserId, tokens.access_token);
  }

  async getUserByUsername(username: string): Promise<TwitterApiResponse> {
    const tokens = twitterOAuthHandler.getStoredTokens();
    if (!tokens) throw new Error('Not authenticated with Twitter');

    return twitterApiClient.getUserByUsername(username, tokens.access_token);
  }
}

export const twitterHandler = new TwitterHandler();
