
import { TwitterTokens } from '@/types/twitter';

class TwitterOAuthHandler {
  private clientId: string = '';
  private clientSecret: string = '';
  private redirectUri: string = `${window.location.origin}/auth/twitter/callback`;

  setCredentials(clientId: string, clientSecret: string): void {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  initiateOAuthFlow(): void {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Twitter Client ID and Client Secret are required');
    }

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

  getStoredTokens(): TwitterTokens | null {
    try {
      const stored = localStorage.getItem('twitter_tokens');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error reading stored Twitter tokens:', error);
      return null;
    }
  }

  clearStoredTokens(): void {
    localStorage.removeItem('twitter_tokens');
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

export const twitterOAuthHandler = new TwitterOAuthHandler();
