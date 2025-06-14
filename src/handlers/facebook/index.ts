
import { ConnectionConfig } from '@/types/platform';
import { FacebookApiResponse } from '@/types/facebook';
import { facebookOAuthHandler } from './oauthHandler';
import { facebookApiClient } from './apiClient';

class FacebookHandler {
  async connect(credentials: Record<string, string>): Promise<boolean> {
    console.log('Starting Facebook OAuth connection...');
    
    // For Facebook, we need to handle OAuth 2.0 flow
    if (credentials.appId && credentials.appSecret) {
      facebookOAuthHandler.setCredentials(credentials.appId, credentials.appSecret);
      
      // Start OAuth flow
      facebookOAuthHandler.initiateOAuthFlow();
      return true;
    }
    
    throw new Error('Facebook App ID and App Secret are required');
  }

  async handleOAuthCallback(code: string, state: string) {
    return facebookOAuthHandler.handleOAuthCallback(code, state);
  }

  async disconnect(connection: ConnectionConfig): Promise<void> {
    console.log('Disconnecting from Facebook...');
    
    // Clear stored tokens and pages
    facebookOAuthHandler.clearStoredTokens();
    
    // In a production app, you might also want to revoke the token
    // by calling Facebook's revoke endpoint
  }

  async test(connection: ConnectionConfig): Promise<boolean> {
    try {
      const tokens = facebookOAuthHandler.getStoredTokens();
      if (!tokens) return false;

      // Test connection by fetching user profile
      const response = await facebookApiClient.getCurrentUser(tokens.access_token);
      return response.data != null;
    } catch (error) {
      console.error('Facebook connection test failed:', error);
      return false;
    }
  }

  // Facebook API Methods
  async postToPage(
    pageId: string, 
    message: string, 
    imageFile?: File
  ): Promise<FacebookApiResponse> {
    const pages = facebookOAuthHandler.getStoredPages();
    const page = pages.find(p => p.id === pageId);
    
    if (!page) throw new Error('Page not found or not authorized');

    return facebookApiClient.postToPage(pageId, page.access_token, message, imageFile);
  }

  async getPagePosts(pageId: string, limit: number = 25): Promise<FacebookApiResponse> {
    const pages = facebookOAuthHandler.getStoredPages();
    const page = pages.find(p => p.id === pageId);
    
    if (!page) throw new Error('Page not found or not authorized');

    return facebookApiClient.getPagePosts(pageId, page.access_token, limit);
  }

  async getPostComments(postId: string, pageId: string, limit: number = 25): Promise<FacebookApiResponse> {
    const pages = facebookOAuthHandler.getStoredPages();
    const page = pages.find(p => p.id === pageId);
    
    if (!page) throw new Error('Page not found or not authorized');

    return facebookApiClient.getPostComments(postId, page.access_token, limit);
  }

  async replyToComment(commentId: string, pageId: string, message: string): Promise<FacebookApiResponse> {
    const pages = facebookOAuthHandler.getStoredPages();
    const page = pages.find(p => p.id === pageId);
    
    if (!page) throw new Error('Page not found or not authorized');

    return facebookApiClient.replyToComment(commentId, page.access_token, message);
  }

  async deletePost(postId: string, pageId: string): Promise<FacebookApiResponse> {
    const pages = facebookOAuthHandler.getStoredPages();
    const page = pages.find(p => p.id === pageId);
    
    if (!page) throw new Error('Page not found or not authorized');

    return facebookApiClient.deletePost(postId, page.access_token);
  }

  async getAvailablePages() {
    return facebookOAuthHandler.getStoredPages();
  }
}

export const facebookHandler = new FacebookHandler();
