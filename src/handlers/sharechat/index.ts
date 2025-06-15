
import { ConnectionConfig } from '@/types/platform';
import { ShareChatApiClient } from './apiClient';
import { ShareChatOAuthHandler } from './oauthHandler';
import { ShareChatAuthCredentials, ShareChatCreatePost } from '@/types/sharechat';

export const sharechatHandler = {
  async connect(credentials: Record<string, string>): Promise<boolean> {
    console.log('Starting ShareChat authentication...');
    
    const { phone, password } = credentials;
    
    if (!phone || !password) {
      throw new Error('ShareChat phone number and password are required');
    }

    try {
      const oauthHandler = new ShareChatOAuthHandler();
      const authCreds: ShareChatAuthCredentials = { phone, password };
      
      const session = await oauthHandler.authenticate(authCreds);
      
      if (!session.auth_token) {
        throw new Error('Failed to obtain authentication token');
      }

      console.log('ShareChat authentication successful');
      return true;
    } catch (error) {
      console.error('ShareChat authentication failed:', error);
      throw new Error(`Failed to authenticate with ShareChat: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async disconnect(connection: ConnectionConfig): Promise<void> {
    console.log('Disconnecting ShareChat...');
    
    try {
      const oauthHandler = new ShareChatOAuthHandler();
      const session = oauthHandler.getStoredSession();
      
      if (session?.auth_token) {
        await oauthHandler.revokeToken(session.auth_token);
      }
      
      oauthHandler.clearStoredSession();
      console.log('ShareChat disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting ShareChat:', error);
      // Don't throw - allow disconnect to continue even if cleanup fails
    }
  },

  async test(connection: ConnectionConfig): Promise<boolean> {
    console.log('Testing ShareChat connection...');
    
    try {
      const oauthHandler = new ShareChatOAuthHandler();
      let session = oauthHandler.getStoredSession();
      
      if (!session) {
        console.log('No stored session found');
        return false;
      }

      // Try to refresh session if it's close to expiry
      const expiryTime = new Date(session.expires_at).getTime();
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;
      
      if (timeUntilExpiry < 60 * 60 * 1000) { // Less than 1 hour
        try {
          session = await oauthHandler.refreshSession(session);
        } catch (refreshError) {
          console.log('Session refresh failed, session may be invalid');
          return false;
        }
      }

      const apiClient = new ShareChatApiClient(session.auth_token);
      const userResponse = await apiClient.getCurrentUser();
      
      if (userResponse.success && userResponse.data) {
        console.log('ShareChat connection test successful');
        return true;
      }
      
      console.log('ShareChat connection test failed');
      return false;
    } catch (error) {
      console.error('ShareChat connection test failed:', error);
      return false;
    }
  },

  // ShareChat-specific methods
  async getFeed(connection: ConnectionConfig, page: number = 1, limit: number = 20) {
    const oauthHandler = new ShareChatOAuthHandler();
    const session = oauthHandler.getStoredSession();
    
    if (!session) throw new Error('Not authenticated with ShareChat');
    
    const apiClient = new ShareChatApiClient(session.auth_token);
    return apiClient.getFeed(page, limit);
  },

  async getPost(connection: ConnectionConfig, postId: string) {
    const oauthHandler = new ShareChatOAuthHandler();
    const session = oauthHandler.getStoredSession();
    
    if (!session) throw new Error('Not authenticated with ShareChat');
    
    const apiClient = new ShareChatApiClient(session.auth_token);
    return apiClient.getPost(postId);
  },

  async searchPosts(connection: ConnectionConfig, query: string, language?: string) {
    const oauthHandler = new ShareChatOAuthHandler();
    const session = oauthHandler.getStoredSession();
    
    if (!session) throw new Error('Not authenticated with ShareChat');
    
    const apiClient = new ShareChatApiClient(session.auth_token);
    return apiClient.searchPosts(query, language);
  },

  async createPost(connection: ConnectionConfig, postData: ShareChatCreatePost) {
    const oauthHandler = new ShareChatOAuthHandler();
    const session = oauthHandler.getStoredSession();
    
    if (!session) throw new Error('Not authenticated with ShareChat');
    
    const apiClient = new ShareChatApiClient(session.auth_token);
    return apiClient.createPost(postData);
  },

  async uploadMedia(connection: ConnectionConfig, file: File) {
    const oauthHandler = new ShareChatOAuthHandler();
    const session = oauthHandler.getStoredSession();
    
    if (!session) throw new Error('Not authenticated with ShareChat');
    
    const apiClient = new ShareChatApiClient(session.auth_token);
    return apiClient.uploadMedia(file);
  },

  async likePost(connection: ConnectionConfig, postId: string) {
    const oauthHandler = new ShareChatOAuthHandler();
    const session = oauthHandler.getStoredSession();
    
    if (!session) throw new Error('Not authenticated with ShareChat');
    
    const apiClient = new ShareChatApiClient(session.auth_token);
    return apiClient.likePost(postId);
  },

  async commentOnPost(connection: ConnectionConfig, postId: string, text: string) {
    const oauthHandler = new ShareChatOAuthHandler();
    const session = oauthHandler.getStoredSession();
    
    if (!session) throw new Error('Not authenticated with ShareChat');
    
    const apiClient = new ShareChatApiClient(session.auth_token);
    return apiClient.commentOnPost(postId, text);
  },

  async getCurrentUser(connection: ConnectionConfig) {
    const oauthHandler = new ShareChatOAuthHandler();
    const session = oauthHandler.getStoredSession();
    
    if (!session) throw new Error('Not authenticated with ShareChat');
    
    const apiClient = new ShareChatApiClient(session.auth_token);
    return apiClient.getCurrentUser();
  },

  async followUser(connection: ConnectionConfig, userId: string) {
    const oauthHandler = new ShareChatOAuthHandler();
    const session = oauthHandler.getStoredSession();
    
    if (!session) throw new Error('Not authenticated with ShareChat');
    
    const apiClient = new ShareChatApiClient(session.auth_token);
    return apiClient.followUser(userId);
  },
};
