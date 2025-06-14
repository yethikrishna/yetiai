
import { TikTokTokens } from '@/types/tiktok';

export class TikTokOAuthHandler {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = `${window.location.origin}/auth/tiktok/callback`;
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_key: this.clientId,
      scope: 'user.info.basic,video.list,video.upload,video.publish',
      response_type: 'code',
      redirect_uri: this.redirectUri,
      state: 'tiktok_oauth_' + Date.now(),
    });

    return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
  }

  async exchangeCodeForTokens(code: string): Promise<TikTokTokens> {
    console.log('Exchanging TikTok authorization code for tokens...');
    
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: new URLSearchParams({
        client_key: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TikTok OAuth error: ${response.status} ${errorText}`);
    }

    const tokens = await response.json();
    
    if (tokens.error) {
      throw new Error(`TikTok OAuth error: ${tokens.error_description || tokens.error}`);
    }

    return tokens;
  }

  async refreshAccessToken(refreshToken: string): Promise<TikTokTokens> {
    console.log('Refreshing TikTok access token...');
    
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TikTok token refresh error: ${response.status} ${errorText}`);
    }

    const tokens = await response.json();
    
    if (tokens.error) {
      throw new Error(`TikTok token refresh error: ${tokens.error_description || tokens.error}`);
    }

    return tokens;
  }

  async revokeToken(token: string): Promise<void> {
    console.log('Revoking TikTok access token...');
    
    const response = await fetch('https://open.tiktokapis.com/v2/oauth/revoke/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: this.clientId,
        client_secret: this.clientSecret,
        token,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TikTok token revocation error: ${response.status} ${errorText}`);
    }
  }
}
