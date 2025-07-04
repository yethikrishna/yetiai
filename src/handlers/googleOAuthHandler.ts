import { ConnectionConfig } from "@/types/platform";
import { secureOAuthHandler } from '@/lib/security/SecureOAuthHandler';
import { securityMonitor } from '@/lib/security/SecurityMonitor';

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
  private readonly ALLOWED_DOMAINS = ['localhost', window.location.hostname];

  constructor() {
    // Initialize with empty values
  }

  /**
   * Configure OAuth settings for a specific Google service
   */
  configure(serviceType: string, clientId: string): void {
    // Validate inputs
    if (!serviceType?.trim() || !clientId?.trim()) {
      throw new Error('Service type and Client ID are required');
    }

    // Validate Google Client ID format
    if (!clientId.includes('.apps.googleusercontent.com')) {
      throw new Error('Invalid Google Client ID format');
    }

    this.serviceType = serviceType.trim();
    this.clientId = clientId.trim();
    this.redirectUri = `${window.location.origin}/oauth/callback/google-${serviceType.toLowerCase()}`;
    
    securityMonitor.logSecurityEvent({
      type: 'suspicious_login',
      severity: 'low',
      details: {
        action: 'google_oauth_configured',
        serviceType: this.serviceType
      }
    });
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

    // Validate redirect URI
    if (!secureOAuthHandler.validateRedirectUri(this.redirectUri, this.ALLOWED_DOMAINS)) {
      throw new Error('Invalid redirect URI');
    }

    const scopes = this.getScopes().join(' ');
    
    // Generate secure OAuth state with PKCE
    const oauthState = secureOAuthHandler.generateOAuthState(
      `google_${this.serviceType}`,
      this.redirectUri,
      true // Use PKCE for enhanced security
    );

    const authParams = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent',
      state: oauthState.state,
      code_challenge: oauthState.codeVerifier ? secureOAuthHandler.generateCodeChallenge(oauthState.codeVerifier) : undefined,
      code_challenge_method: oauthState.codeVerifier ? 'plain' : undefined
    });

    // Remove undefined values
    Object.keys(authParams).forEach(key => {
      if (authParams.get(key) === 'undefined') {
        authParams.delete(key);
      }
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${authParams.toString()}`;
    
    const w = window.open(authUrl, "_blank", "width=500,height=700");
    if (!w) window.location.href = authUrl;
  }

  /**
   * Handle the OAuth callback from Google
   */
  async handleCallback(code: string, state: string): Promise<GoogleTokens> {
    // Validate OAuth state securely
    const oauthState = secureOAuthHandler.validateOAuthState(state, `google_${this.serviceType}`);
    if (!oauthState) {
      throw new Error('Invalid or expired OAuth state');
    }

    // Validate authorization code
    if (!code || code.length < 10) {
      throw new Error('Invalid authorization code');
    }

    try {
      // The actual token exchange happens in the Supabase Edge Function
      const functionUrl = `https://cihwjfeunygzjhftydpf.supabase.co/functions/v1/google-oauth`;
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpaHdqZmV1bnlnempoZnR5ZHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3NzQ5NTIsImV4cCI6MjA2NjM1MDk1Mn0.4SDX68Aw8MHoyGZEdaDOCdMLUwV7do2iUB1hoI-uf6M`
        },
        body: JSON.stringify({
          code,
          redirectUri: this.redirectUri,
          service: this.serviceType.toLowerCase(),
          codeVerifier: oauthState.codeVerifier
        })
      });

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`);
      }

      const tokens: GoogleTokens = await response.json();
      
      // Store tokens securely using SecureOAuthHandler
      secureOAuthHandler.storeTokens(`google_${this.serviceType}`, tokens);
      
      return tokens;
    } catch (error) {
      securityMonitor.logSecurityEvent({
        type: 'unauthorized_access',
        severity: 'medium',
        details: {
          action: 'google_token_exchange_failed',
          service: this.serviceType,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      throw error;
    }
  }

  /**
   * Store tokens securely
   */
  private storeTokens(tokens: GoogleTokens): void {
    secureOAuthHandler.storeTokens(`google_${this.serviceType}`, tokens);
  }

  /**
   * Retrieve stored tokens
   */
  getStoredTokens(): GoogleTokens | null {
    const tokens = secureOAuthHandler.getStoredTokens(`google_${this.serviceType}`);
    return tokens as GoogleTokens | null;
  }

  /**
   * Clear stored tokens
   */
  clearStoredTokens(): void {
    secureOAuthHandler.clearTokens(`google_${this.serviceType}`);
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
   * Check if tokens are about to expire
   */
  isTokenExpiring(): boolean {
    return secureOAuthHandler.isTokenExpiring(`google_${this.serviceType}`);
  }
}

// Create and export a singleton instance
export const googleOAuthHandler = new GoogleOAuthHandler();
