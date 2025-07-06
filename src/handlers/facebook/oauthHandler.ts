
import { FacebookTokens, FacebookPageToken } from '@/types/facebook';
import { facebookApiClient } from './apiClient';
import { secureOAuthHandler } from '@/lib/security/SecureOAuthHandler';
import { securityMonitor } from '@/lib/security/SecurityMonitor';
import { secureStorage } from '@/lib/security/SecureStorage';

class FacebookOAuthHandler {
  private appId: string = '';
  private appSecret: string = '';
  private redirectUri: string = `${window.location.origin}/auth/facebook/callback`;
  private readonly ALLOWED_DOMAINS = ['localhost', window.location.hostname];

  setCredentials(appId: string, appSecret: string): void {
    // Validate credentials are not empty
    if (!appId?.trim() || !appSecret?.trim()) {
      throw new Error('Facebook App ID and App Secret are required and cannot be empty');
    }

    // Validate App ID format (should be numeric)
    if (!/^\d+$/.test(appId.trim())) {
      throw new Error('Invalid Facebook App ID format');
    }

    this.appId = appId.trim();
    this.appSecret = appSecret.trim();
    
    securityMonitor.logSecurityEvent({
      type: 'suspicious_login',
      severity: 'low',
      details: {
        action: 'facebook_credentials_set',
        appIdLength: this.appId.length
      }
    });
  }

  initiateOAuthFlow(): void {
    if (!this.appId || !this.appSecret) {
      throw new Error('Facebook App ID and App Secret are required');
    }

    // Validate redirect URI
    if (!secureOAuthHandler.validateRedirectUri(this.redirectUri, this.ALLOWED_DOMAINS)) {
      throw new Error('Invalid redirect URI');
    }

    const scopes = [
      'pages_manage_posts',
      'pages_read_engagement', 
      'pages_show_list',
      'pages_read_user_content',
      'publish_to_groups'
    ].join(',');

    // Generate secure OAuth state
    const oauthState = secureOAuthHandler.generateOAuthState('facebook', this.redirectUri);

    const authParams = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      scope: scopes,
      response_type: 'code',
      state: oauthState.state
    });

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?${authParams.toString()}`;
    window.location.href = authUrl;
  }

  async handleOAuthCallback(code: string, state: string): Promise<FacebookTokens> {
    // Validate OAuth state securely
    const oauthState = secureOAuthHandler.validateOAuthState(state, 'facebook');
    if (!oauthState) {
      throw new Error('Invalid or expired OAuth state');
    }

    // Validate authorization code
    if (!code || code.length < 10) {
      throw new Error('Invalid authorization code');
    }

    try {
      // Exchange code for access token via Supabase edge function for security
      const response = await fetch('https://cihwjfeunygzjhftydpf.supabase.co/functions/v1/facebook-oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaHdqZmV1bnlnempoZnR5ZHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NzQ5NTIsImV4cCI6MjA2NjM1MDk1Mn0.4SDX68Aw8MHoyGZEdaDOCdMLUwV7do2iUB1hoI-uf6M`
        },
        body: JSON.stringify({
          code,
          redirectUri: this.redirectUri,
          appId: this.appId
        })
      });
      
      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const tokens: FacebookTokens = await response.json();
      
      // Store tokens securely using SecureOAuthHandler
      secureOAuthHandler.storeTokens('facebook', tokens);
      
      // Get and store page tokens securely
      try {
        const pages = await facebookApiClient.getUserPages(tokens.access_token);
        secureStorage.setItem('facebook_pages', pages, { encrypt: true });
      } catch (pageError) {
        console.warn('Failed to fetch Facebook pages:', pageError);
        // Continue without pages - not critical for basic functionality
      }
      
      return tokens;
    } catch (error) {
      securityMonitor.logSecurityEvent({
        type: 'unauthorized_access',
        severity: 'medium',
        details: {
          action: 'facebook_token_exchange_failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      throw error;
    }
  }

  getStoredTokens(): FacebookTokens | null {
    const tokens = secureOAuthHandler.getStoredTokens('facebook');
    return tokens as FacebookTokens | null;
  }

  getStoredPages(): FacebookPageToken[] {
    try {
      const pages = secureStorage.getItem<FacebookPageToken[]>('facebook_pages');
      return pages || [];
    } catch (error) {
      console.error('Error reading stored Facebook pages:', error);
      return [];
    }
  }

  clearStoredTokens(): void {
    secureOAuthHandler.clearTokens('facebook');
    secureStorage.removeItem('facebook_pages');
  }

  /**
   * Test if stored tokens are still valid
   */
  async testTokenValidity(): Promise<boolean> {
    const tokens = this.getStoredTokens();
    if (!tokens) return false;

    try {
      const response = await fetch(`https://graph.facebook.com/me?access_token=${tokens.access_token}`);
      return response.ok;
    } catch (error) {
      console.error('Facebook token validation failed:', error);
      return false;
    }
  }
}

export const facebookOAuthHandler = new FacebookOAuthHandler();
