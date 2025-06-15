
import { ConnectionConfig } from '@/types/platform';
import { KooApiClient } from './apiClient';
import { KooOAuthHandler } from './oauthHandler';
import { KooAuthCredentials, KooSession } from '@/types/koo';

export const kooHandler = {
  async connect(credentials: Record<string, string>): Promise<boolean> {
    console.log('Connecting to Koo...');

    try {
      const { email, password } = credentials;

      if (!email || !password) {
        throw new Error('Email and password are required for Koo connection');
      }

      const authHandler = new KooOAuthHandler();
      const session = await authHandler.authenticate({ email, password });

      // Store the session data in credentials for later use
      Object.assign(credentials, {
        session_id: session.session_id,
        csrf_token: session.csrf_token,
        user_id: session.user_id,
        expires_at: session.expires_at,
      });

      // Test the connection
      const apiClient = new KooApiClient(authHandler.sessionToTokens(session));
      const profileTest = await apiClient.getProfile();

      if (!profileTest.success) {
        throw new Error('Failed to verify Koo connection');
      }

      console.log('Koo connection successful');
      return true;

    } catch (error) {
      console.error('Koo connection failed:', error);
      throw error;
    }
  },

  async disconnect(connection: ConnectionConfig): Promise<void> {
    console.log('Disconnecting from Koo...');
    // For session-based auth, we don't need to revoke tokens
    // Just clear the stored credentials
    console.log('Koo disconnection completed');
  },

  async test(connection: ConnectionConfig): Promise<boolean> {
    console.log('Testing Koo connection...');

    try {
      const { session_id, csrf_token, user_id, expires_at } = connection.credentials;

      if (!session_id || !csrf_token || !user_id) {
        return false;
      }

      const session: KooSession = {
        session_id,
        csrf_token,
        user_id,
        expires_at: expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      const authHandler = new KooOAuthHandler();
      const isValid = await authHandler.validateSession(session);

      if (isValid) {
        console.log('Koo connection test passed');
        return true;
      } else {
        console.log('Koo connection test failed - session invalid');
        return false;
      }

    } catch (error) {
      console.error('Koo connection test failed:', error);
      return false;
    }
  },

  // Helper methods for API operations
  async getClient(connection: ConnectionConfig): Promise<KooApiClient> {
    const { session_id, csrf_token, user_id } = connection.credentials;
    
    if (!session_id || !csrf_token || !user_id) {
      throw new Error('Invalid Koo connection credentials');
    }

    return new KooApiClient({
      session_id,
      csrf_token,
      user_id,
    });
  },

  async createKoo(connection: ConnectionConfig, text: string, mediaUrls?: string[]): Promise<any> {
    const client = await this.getClient(connection);
    return client.createKoo({ text, media_urls: mediaUrls });
  },

  async getTimeline(connection: ConnectionConfig, page = 1, limit = 20): Promise<any> {
    const client = await this.getClient(connection);
    return client.getTimeline(page, limit);
  },

  async searchKoos(connection: ConnectionConfig, query: string, page = 1): Promise<any> {
    const client = await this.getClient(connection);
    return client.searchKoos(query, page);
  },

  async likeKoo(connection: ConnectionConfig, kooId: string): Promise<any> {
    const client = await this.getClient(connection);
    return client.likeKoo(kooId);
  },

  async rekoo(connection: ConnectionConfig, kooId: string): Promise<any> {
    const client = await this.getClient(connection);
    return client.rekoo(kooId);
  },
};
