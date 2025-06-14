
import { LinkedInTokens } from '@/types/linkedin';

export class LinkedInOAuthHandler {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private scopes = ['r_liteprofile', 'r_emailaddress', 'w_member_social'];

  constructor(clientId: string, clientSecret: string, redirectUri?: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri || `${window.location.origin}/auth/linkedin/callback`;
  }

  getAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(' '),
      state: state || this.generateState(),
    });

    return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<LinkedInTokens> {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error_description: 'Unknown error' }));
      throw new Error(`LinkedIn OAuth Error: ${error.error_description || response.statusText}`);
    }

    return response.json();
  }

  async refreshToken(refreshToken: string): Promise<LinkedInTokens> {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error_description: 'Unknown error' }));
      throw new Error(`LinkedIn Token Refresh Error: ${error.error_description || response.statusText}`);
    }

    return response.json();
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
