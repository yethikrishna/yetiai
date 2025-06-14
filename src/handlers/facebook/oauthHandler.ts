
import { FacebookTokens, FacebookPageToken } from '@/types/facebook';
import { facebookApiClient } from './apiClient';

class FacebookOAuthHandler {
  private appId: string = '';
  private appSecret: string = '';
  private redirectUri: string = `${window.location.origin}/auth/facebook/callback`;

  setCredentials(appId: string, appSecret: string): void {
    this.appId = appId;
    this.appSecret = appSecret;
  }

  initiateOAuthFlow(): void {
    if (!this.appId || !this.appSecret) {
      throw new Error('Facebook App ID and App Secret are required');
    }

    const scopes = [
      'pages_manage_posts',
      'pages_read_engagement', 
      'pages_show_list',
      'pages_read_user_content',
      'publish_to_groups'
    ].join(',');

    const state = this.generateRandomString(32);
    
    // Store state for verification
    localStorage.setItem('facebook_oauth_state', state);

    const authParams = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      scope: scopes,
      response_type: 'code',
      state: state
    });

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${authParams.toString()}`;
    window.location.href = authUrl;
  }

  async handleOAuthCallback(code: string, state: string): Promise<FacebookTokens> {
    const storedState = localStorage.getItem('facebook_oauth_state');

    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    // Exchange code for access token
    const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token`;
    const tokenParams = new URLSearchParams({
      client_id: this.appId,
      client_secret: this.appSecret,
      redirect_uri: this.redirectUri,
      code: code
    });

    const response = await fetch(`${tokenUrl}?${tokenParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const tokens: FacebookTokens = await response.json();
    
    // Clean up stored values
    localStorage.removeItem('facebook_oauth_state');
    
    // Get and store page tokens
    const pages = await facebookApiClient.getUserPages(tokens.access_token);
    
    // Store tokens and pages securely
    localStorage.setItem('facebook_tokens', JSON.stringify(tokens));
    localStorage.setItem('facebook_pages', JSON.stringify(pages));
    
    return tokens;
  }

  getStoredTokens(): FacebookTokens | null {
    try {
      const stored = localStorage.getItem('facebook_tokens');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading stored Facebook tokens:', error);
      return null;
    }
  }

  getStoredPages(): FacebookPageToken[] {
    try {
      const stored = localStorage.getItem('facebook_pages');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading stored Facebook pages:', error);
      return [];
    }
  }

  clearStoredTokens(): void {
    localStorage.removeItem('facebook_tokens');
    localStorage.removeItem('facebook_pages');
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

export const facebookOAuthHandler = new FacebookOAuthHandler();
