import { ConnectionConfig } from "@/types/platform";

// Types for Google OAuth tokens and responses
export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

export interface GoogleUserProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
  given_name?: string;
  family_name?: string;
}

// Service-specific scopes
export const GOOGLE_SCOPES = {
  GMAIL: [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify"
  ],
  DRIVE: [
    "https://www.googleapis.com/auth/drive.file"
  ],
  SHEETS: [
    "https://www.googleapis.com/auth/spreadsheets"
  ],
  DOCS: [
    "https://www.googleapis.com/auth/documents"
  ],
  // Common scopes used by most Google services
  COMMON: [
    "openid",
    "email",
    "profile"
  ]
};

class GoogleOAuthHandler {
  private clientId: string = '';
  private redirectUri: string = '';
  private serviceType: string = '';

  constructor() {
    // Initialize with empty values
  }

  /**
   * Configure OAuth settings for a specific Google service
   */
  configure(serviceType: string, clientId: string): void {
    this.serviceType = serviceType;
    this.clientId = clientId;
    this.redirectUri = `${window.location.origin}/oauth/callback/google-${serviceType.toLowerCase()}`;
  }

  /**
   * Get appropriate scopes based on service type
   */
  getScopes(): string[] {
    const scopes = [...GOOGLE_SCOPES.COMMON];

    switch (this.serviceType.toLowerCase()) {
      case 'gmail':
        return [...scopes, ...GOOGLE_SCOPES.GMAIL];
      case 'drive':
        return [...scopes, ...GOOGLE_SCOPES.DRIVE];
      case 'sheets':
        return [...scopes, ...GOOGLE_SCOPES.SHEETS];
      case 'docs':
        return [...scopes, ...GOOGLE_SCOPES.DOCS];
      default:
        return scopes;
    }
  }

  /**
   * Initiate the OAuth flow for a Google service
   */
  initiateOAuthFlow(): void {
    if (!this.clientId || !this.serviceType) {
      throw new Error('Google Client ID and service type are required');
    }

    const scopes = this.getScopes().join(' ');
    const state = this.generateRandomString(32);
    
    // Store state for verification
    localStorage.setItem(`google_${this.serviceType.toLowerCase()}_oauth_state`, state);

    const authParams = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent',
      state: state
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;
    
    const w = window.open(authUrl, "_blank", "width=500,height=700");
    if (!w) window.location.href = authUrl;
  }

  /**
   * Handle the OAuth callback from Google
   */
  async handleCallback(code: string, state: string): Promise<GoogleTokens> {
    const storedState = localStorage.getItem(`google_${this.serviceType.toLowerCase()}_oauth_state`);
    
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    // The actual token exchange happens in the Supabase Edge Function
    // Here we prepare the request to that function
    const functionUrl = `${process.env.VITE_SUPABASE_FUNCTION_URL}/google-oauth`;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        redirectUri: this.redirectUri,
        service: this.serviceType.toLowerCase()
      })
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const tokens: GoogleTokens = await response.json();
    
    // Clean up stored state
    localStorage.removeItem(`google_${this.serviceType.toLowerCase()}_oauth_state`);
    
    // Store tokens securely
    this.storeTokens(tokens);
    
    return tokens;
  }

  /**
   * Store tokens securely
   */
  private storeTokens(tokens: GoogleTokens): void {
    localStorage.setItem(`google_${this.serviceType.toLowerCase()}_tokens`, JSON.stringify(tokens));
  }

  /**
   * Retrieve stored tokens
   */
  getStoredTokens(): GoogleTokens | null {
    try {
      const stored = localStorage.getItem(`google_${this.serviceType.toLowerCase()}_tokens`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error(`Error reading stored Google ${this.serviceType} tokens:`, error);
      return null;
    }
  }

  /**
   * Clear stored tokens
   */
  clearStoredTokens(): void {
    localStorage.removeItem(`google_${this.serviceType.toLowerCase()}_tokens`);
  }

  /**
   * Make an authenticated request to a Google API
   */
  async makeAuthenticatedRequest(
    endpoint: string, 
    accessToken: string, 
    options: RequestInit = {}
  ): Promise<any> {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user profile information
   */
  async getUserProfile(accessToken: string): Promise<GoogleUserProfile> {
    return this.makeAuthenticatedRequest(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      accessToken
    );
  }

  /**
   * Refresh an expired access token
   */
  async refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
    // This would typically be handled by the Supabase Edge Function
    const functionUrl = `${process.env.VITE_SUPABASE_FUNCTION_URL}/google-oauth`;
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refresh_token: refreshToken,
        service: this.serviceType.toLowerCase()
      })
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.statusText}`);
    }

    const tokens: GoogleTokens = await response.json();
    this.storeTokens(tokens);
    
    return tokens;
  }

  /**
   * Test if the current tokens are valid
   */
  async testConnection(accessToken: string): Promise<boolean> {
    try {
      await this.getUserProfile(accessToken);
      return true;
    } catch (error) {
      console.error(`Google ${this.serviceType} connection test failed:`, error);
      return false;
    }
  }

  /**
   * Generate a random string for state parameter
   */
  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// Create and export a singleton instance
export const googleOAuthHandler = new GoogleOAuthHandler();
