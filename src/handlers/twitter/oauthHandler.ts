
import { TwitterTokens } from '@/types/twitter';
import { secureOAuthHandler } from '@/lib/security/SecureOAuthHandler';
import { securityMonitor } from '@/lib/security/SecurityMonitor';

class TwitterOAuthHandler {
  private clientId: string = '';
  private clientSecret: string = '';
  private redirectUri: string = `${window.location.origin}/auth/twitter/callback`;
  private readonly ALLOWED_DOMAINS = ['localhost', window.location.hostname];

  setCredentials(clientId: string, clientSecret: string): void {
    // Validate credentials
    if (!clientId?.trim() || !clientSecret?.trim()) {
      throw new Error('Twitter Client ID and Client Secret are required');
    }

    this.clientId = clientId.trim();
    this.clientSecret = clientSecret.trim();
    
    securityMonitor.logSecurityEvent({
      type: 'suspicious_login',
      severity: 'low',
      details: {
        action: 'twitter_credentials_set',
        clientIdLength: this.clientId.length
      }
    });
  }

  initiateOAuthFlow(): void {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Twitter Client ID and Client Secret are required');
    }

    // Validate redirect URI
    if (!secureOAuthHandler.validateRedirectUri(this.redirectUri, this.ALLOWED_DOMAINS)) {
      throw new Error('Invalid redirect URI');
    }

    const scopes = [
      'tweet.read',
      'tweet.write', 
      'users.read',
      'follows.read',
      'follows.write',
      'offline.access'
    ].join(' ');

    // Generate secure OAuth state with PKCE
    const oauthState = secureOAuthHandler.generateOAuthState('twitter', this.redirectUri, true);

    const authParams = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: scopes,
      state: oauthState.state,
      code_challenge: oauthState.codeVerifier ? secureOAuthHandler.generateCodeChallenge(oauthState.codeVerifier!) : undefined,
      code_challenge_method: 'plain'
    });

    // Remove undefined values
    Object.keys(authParams).forEach(key => {
      if (authParams.get(key) === 'undefined') {
        authParams.delete(key);
      }
    });

    const authUrl = `https://twitter.com/i/oauth2/authorize?${authParams.toString()}`;
    window.location.href = authUrl;
  }

  async handleOAuthCallback(code: string, state: string): Promise<TwitterTokens> {
    // Validate OAuth state securely
    const oauthState = secureOAuthHandler.validateOAuthState(state, 'twitter');
    if (!oauthState) {
      throw new Error('Invalid or expired OAuth state');
    }

    // Validate authorization code
    if (!code || code.length < 10) {
      throw new Error('Invalid authorization code');
    }

    try {
      // Use Supabase edge function for secure token exchange
      const response = await fetch('https://cihwjfeunygzjhftydpf.supabase.co/functions/v1/twitter-oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaHdqZmV1bnlnempoZnR5ZHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NzQ5NTIsImV4cCI6MjA2NjM1MDk1Mn0.4SDX68Aw8MHoyGZEdaDOCdMLUwV7do2iUB1hoI-uf6M`
        },
        body: JSON.stringify({
          code,
          redirectUri: this.redirectUri,
          clientId: this.clientId,
          codeVerifier: oauthState.codeVerifier
        })
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const tokens: TwitterTokens = await response.json();
      
      // Store tokens securely using SecureOAuthHandler
      secureOAuthHandler.storeTokens('twitter', tokens);
      
      return tokens;
    } catch (error) {
      securityMonitor.logSecurityEvent({
        type: 'unauthorized_access',
        severity: 'medium',
        details: {
          action: 'twitter_token_exchange_failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      throw error;
    }
  }

  getStoredTokens(): TwitterTokens | null {
    const tokens = secureOAuthHandler.getStoredTokens('twitter');
    return tokens as TwitterTokens | null;
  }

  clearStoredTokens(): void {
    secureOAuthHandler.clearTokens('twitter');
  }

  /**
   * Test if stored tokens are still valid
   */
  async testTokenValidity(): Promise<boolean> {
    const tokens = this.getStoredTokens();
    if (!tokens) return false;

    try {
      const response = await fetch('https://api.twitter.com/2/users/me', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Twitter token validation failed:', error);
      return false;
    }
  }
}

export const twitterOAuthHandler = new TwitterOAuthHandler();
