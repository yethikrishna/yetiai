
import { InstagramTokens, InstagramPageToken } from '@/types/instagram';

export class InstagramOAuthHandler {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = `${window.location.origin}/auth/instagram/callback`;
  }

  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'instagram_basic,pages_show_list,instagram_content_publish,pages_read_engagement',
      response_type: 'code',
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<InstagramTokens> {
    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uri: this.redirectUri,
      code: code,
    });

    const response = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
      method: 'POST',
      body: params,
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`OAuth error: ${data.error.message}`);
    }

    return data;
  }

  async getInstagramAccountId(accessToken: string): Promise<{ pageAccessToken: string; instagramAccountId: string }> {
    // Step 1: Get Facebook Pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
    );
    const pagesData = await pagesResponse.json();

    if (pagesData.error || !pagesData.data?.length) {
      throw new Error('No Facebook pages found. Instagram Business account must be linked to a Facebook page.');
    }

    const page = pagesData.data[0] as InstagramPageToken;
    const pageAccessToken = page.access_token;

    // Step 2: Get Instagram Business Account from the page
    const instagramResponse = await fetch(
      `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${pageAccessToken}`
    );
    const instagramData = await instagramResponse.json();

    if (instagramData.error || !instagramData.instagram_business_account) {
      throw new Error('No Instagram Business account found linked to this Facebook page.');
    }

    return {
      pageAccessToken,
      instagramAccountId: instagramData.instagram_business_account.id,
    };
  }

  async getLongLivedToken(shortLivedToken: string): Promise<InstagramTokens> {
    const params = new URLSearchParams({
      grant_type: 'fb_exchange_token',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      fb_exchange_token: shortLivedToken,
    });

    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(`Token exchange error: ${data.error.message}`);
    }

    return data;
  }
}
