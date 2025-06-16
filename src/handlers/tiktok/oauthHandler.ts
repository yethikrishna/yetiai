
import { TikTokTokens, TikTokClientAccessToken } from '@/types/tiktok';

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
      scope: 'user.info.basic,user.info.profile,user.info.stats,video.list,video.upload,video.publish',
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
      const errorText = await response.text().catch(() => 'Could not retrieve error text.');
      // Attempt to parse as JSON to get log_id if available
      let log_id = 'N/A';
      try {
        const errorJson = JSON.parse(errorText);
        log_id = errorJson.log_id || errorJson.data?.log_id || log_id;
      } catch (e) {
        // Not a JSON response or log_id not found
      }
      const errorMessage = `TikTok OAuth error: ${response.status} ${errorText} (Log ID: ${log_id})`;
      console.error(errorMessage, { status: response.status, errorText });
      throw new Error(errorMessage);
    }

    const tokens = await response.json(); // Assuming TikTokTokens or TikTokClientAccessToken type
    
    // Check if the tokens object itself is an error response (common for TikTok)
    // The 'error' field is part of TikTokClientAccessToken, and also a common pattern for TikTokTokens errors.
    if (tokens.error) {
      const errorPayload = tokens as TikTokClientAccessToken; // Cast to access error fields
      const errorMessage = `TikTok OAuth error: ${errorPayload.error_description || errorPayload.error} (Log ID: ${errorPayload.log_id || 'N/A'})`;
      console.error(errorMessage, errorPayload);
      throw new Error(errorMessage);
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
      const errorText = await response.text().catch(() => 'Could not retrieve error text.');
      let log_id = 'N/A';
      try {
        const errorJson = JSON.parse(errorText);
        log_id = errorJson.log_id || errorJson.data?.log_id || log_id;
      } catch (e) {
        // Not a JSON response or log_id not found
      }
      const errorMessage = `TikTok token refresh error: ${response.status} ${errorText} (Log ID: ${log_id})`;
      console.error(errorMessage, { status: response.status, errorText });
      throw new Error(errorMessage);
    }

    const tokens = await response.json(); // Assuming TikTokTokens
    
    if (tokens.error) {
      // Assuming error structure might be similar to TikTokClientAccessToken for log_id
      const errorPayload = tokens as any; // Use 'any' if TikTokTokens doesn't directly define log_id for errors
      const errorMessage = `TikTok token refresh error: ${errorPayload.error_description || errorPayload.error} (Log ID: ${errorPayload.log_id || 'N/A'})`;
      console.error(errorMessage, errorPayload);
      throw new Error(errorMessage);
    }

    return tokens;
  }

  async getClientAccessToken(): Promise<TikTokClientAccessToken> {
    console.log('Getting TikTok client access token...');

    const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cache-Control': 'no-cache',
      },
      body: new URLSearchParams({
        client_key: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Could not retrieve error text.');
      let log_id = 'N/A';
      try {
        const errorJson = JSON.parse(errorText);
        log_id = errorJson.log_id || errorJson.data?.log_id || log_id;
      } catch (e) {
        // Not a JSON response or log_id not found
      }
      const errorMessage = `TikTok Client Credentials error: ${response.status} ${errorText} (Log ID: ${log_id})`;
      console.error(errorMessage, { status: response.status, errorText });
      throw new Error(errorMessage);
    }

    const tokens = await response.json() as TikTokClientAccessToken;

    if (tokens.error) {
      const errorMessage = `TikTok Client Credentials error: ${tokens.error_description || tokens.error} (Log ID: ${tokens.log_id || 'N/A'})`;
      console.error(errorMessage, tokens);
      throw new Error(errorMessage);
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
      // Try to parse error response for more details, including log_id
      const errorText = await response.text().catch(() => 'Could not retrieve error text.');
      let log_id = 'N/A';
      let errorCode = response.status;
      let errorMessageContent = errorText;

      try {
        const errorJson = JSON.parse(errorText);
        // TikTok's revoke endpoint might return error details in a specific format
        // For example, if it's { "data": { "error_code": ..., "description": ... }, "log_id": ... }
        // Or { "error": { "code": ..., "message": ..., "log_id": ... } }
        if (errorJson.error && errorJson.error.code) { // Standard API error structure
            errorCode = errorJson.error.code;
            errorMessageContent = errorJson.error.message;
            log_id = errorJson.error.log_id || log_id;
        } else if (errorJson.data && errorJson.data.error_code) { // Another common structure
            errorCode = errorJson.data.error_code;
            errorMessageContent = errorJson.data.description;
            log_id = errorJson.data.log_id || errorJson.log_id || log_id; // log_id might be top-level or nested
        } else if (errorJson.code && errorJson.message) { // Direct error object
            errorCode = errorJson.code;
            errorMessageContent = errorJson.message;
            log_id = errorJson.log_id || log_id;
        }
      } catch (e) {
        // Not a JSON response or structure not as expected
      }

      const errorMessage = `TikTok token revocation error: ${errorCode} ${errorMessageContent} (Log ID: ${log_id})`;
      console.error(errorMessage, { status: response.status, errorText });
      throw new Error(errorMessage);
    }
    // Check for JSON response even on success, as it might contain status or log_id
    const result = await response.json().catch(() => ({})); // Default to empty object if not JSON
    console.log('TikTok token revocation successful.', result);
    // Revoke typically doesn't return a body on success, but if it does, log it.
    // If there's a specific success code or message pattern, handle it here.
  }
}
