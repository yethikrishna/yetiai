import { secureStorage } from './SecureStorage';
import { securityMonitor } from './SecurityMonitor';

export interface OAuthState {
  state: string;
  codeVerifier?: string;
  timestamp: number;
  provider: string;
  redirectUri: string;
}

export interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type: string;
  scope?: string;
  [key: string]: any; // Allow additional properties for platform-specific tokens
}

/**
 * Secure OAuth handler that provides enhanced security for OAuth flows
 */
export class SecureOAuthHandler {
  private readonly STATE_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

  /**
   * Generate secure OAuth state with PKCE support
   */
  generateOAuthState(provider: string, redirectUri: string, usePKCE = false): OAuthState {
    const state = secureStorage.generateSecureToken(32);
    const codeVerifier = usePKCE ? secureStorage.generateSecureToken(128) : undefined;
    
    const oauthState: OAuthState = {
      state,
      codeVerifier,
      timestamp: Date.now(),
      provider,
      redirectUri
    };

    // Store state securely with TTL
    secureStorage.setItem(`oauth_state_${state}`, oauthState, {
      encrypt: true,
      ttl: this.STATE_TTL
    });

    securityMonitor.logSecurityEvent({
      type: 'suspicious_login',
      severity: 'low',
      details: {
        action: 'oauth_state_generated',
        provider,
        usePKCE,
        stateLength: state.length
      }
    });

    return oauthState;
  }

  /**
   * Validate OAuth state and retrieve stored data
   */
  validateOAuthState(state: string, provider: string): OAuthState | null {
    try {
      const storedState = secureStorage.getItem<OAuthState>(`oauth_state_${state}`);
      
      if (!storedState) {
        securityMonitor.logSecurityEvent({
          type: 'unauthorized_access',
          severity: 'high',
          details: {
            action: 'invalid_oauth_state',
            provider,
            state: state.substring(0, 8) + '...' // Log partial state for debugging
          }
        });
        return null;
      }

      // Validate provider matches
      if (storedState.provider !== provider) {
        securityMonitor.logSecurityEvent({
          type: 'unauthorized_access',
          severity: 'high',
          details: {
            action: 'oauth_provider_mismatch',
            expected: storedState.provider,
            received: provider
          }
        });
        return null;
      }

      // Clean up used state
      secureStorage.removeItem(`oauth_state_${state}`);
      
      securityMonitor.logSecurityEvent({
        type: 'suspicious_login',
        severity: 'low',
        details: {
          action: 'oauth_state_validated',
          provider,
          ageMs: Date.now() - storedState.timestamp
        }
      });

      return storedState;
    } catch (error) {
      securityMonitor.logSecurityEvent({
        type: 'unauthorized_access',
        severity: 'medium',
        details: {
          action: 'oauth_state_validation_error',
          provider,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      return null;
    }
  }

  /**
   * Securely store OAuth tokens
   */
  storeTokens(provider: string, tokens: OAuthTokens, userId?: string): void {
    try {
      const tokenData = {
        ...tokens,
        timestamp: Date.now(),
        provider,
        userId
      };

      // Calculate TTL based on token expiration
      const ttl = tokens.expires_in 
        ? tokens.expires_in * 1000 
        : this.TOKEN_TTL;

      secureStorage.setItem(`oauth_tokens_${provider}`, tokenData, {
        encrypt: true,
        ttl
      });

      // Store refresh token separately if available
      if (tokens.refresh_token) {
        secureStorage.setItem(`oauth_refresh_${provider}`, {
          refresh_token: tokens.refresh_token,
          timestamp: Date.now(),
          provider,
          userId
        }, {
          encrypt: true,
          ttl: this.TOKEN_TTL * 4 // Refresh tokens live longer
        });
      }

      securityMonitor.logSecurityEvent({
        type: 'suspicious_login',
        severity: 'low',
        details: {
          action: 'oauth_tokens_stored',
          provider,
          hasRefreshToken: !!tokens.refresh_token,
          expiresIn: tokens.expires_in
        }
      });
    } catch (error) {
      securityMonitor.logSecurityEvent({
        type: 'unauthorized_access',
        severity: 'medium',
        details: {
          action: 'oauth_token_storage_failed',
          provider,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      throw new Error('Failed to store OAuth tokens securely');
    }
  }

  /**
   * Retrieve stored OAuth tokens
   */
  getStoredTokens(provider: string): OAuthTokens | null {
    try {
      const tokens = secureStorage.getItem<OAuthTokens & { timestamp: number }>(`oauth_tokens_${provider}`);
      
      if (tokens) {
        securityMonitor.logSecurityEvent({
          type: 'suspicious_login',
          severity: 'low',
          details: {
            action: 'oauth_tokens_retrieved',
            provider,
            age: Date.now() - tokens.timestamp
          }
        });
      }

      return tokens;
    } catch (error) {
      securityMonitor.logSecurityEvent({
        type: 'unauthorized_access',
        severity: 'medium',
        details: {
          action: 'oauth_token_retrieval_failed',
          provider,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      return null;
    }
  }

  /**
   * Clear OAuth tokens for a provider
   */
  clearTokens(provider: string): void {
    try {
      secureStorage.removeItem(`oauth_tokens_${provider}`);
      secureStorage.removeItem(`oauth_refresh_${provider}`);
      
      securityMonitor.logSecurityEvent({
        type: 'suspicious_login',
        severity: 'low',
        details: {
          action: 'oauth_tokens_cleared',
          provider
        }
      });
    } catch (error) {
      console.error('Error clearing OAuth tokens:', error);
    }
  }

  /**
   * Generate PKCE code challenge from code verifier
   */
  generateCodeChallenge(codeVerifier: string): string {
    // For simplicity, using plain text method
    // In production, use SHA256 hash
    return codeVerifier;
  }

  /**
   * Check if tokens are about to expire
   */
  isTokenExpiring(provider: string, thresholdMinutes = 5): boolean {
    const tokens = this.getStoredTokens(provider);
    if (!tokens || !tokens.expires_in) return false;

    const expirationTime = (tokens as any).timestamp + (tokens.expires_in * 1000);
    const thresholdTime = Date.now() + (thresholdMinutes * 60 * 1000);
    
    return expirationTime <= thresholdTime;
  }

  /**
   * Validate redirect URI to prevent open redirect attacks
   */
  validateRedirectUri(redirectUri: string, allowedDomains: string[]): boolean {
    try {
      const url = new URL(redirectUri);
      
      // Check if domain is in allowed list
      const isAllowed = allowedDomains.some(domain => 
        url.hostname === domain || url.hostname.endsWith(`.${domain}`)
      );

      if (!isAllowed) {
        securityMonitor.logSecurityEvent({
          type: 'unauthorized_access',
          severity: 'high',
          details: {
            action: 'invalid_redirect_uri',
            redirectUri,
            allowedDomains
          }
        });
      }

      return isAllowed;
    } catch (error) {
      securityMonitor.logSecurityEvent({
        type: 'unauthorized_access',
        severity: 'high',
        details: {
          action: 'malformed_redirect_uri',
          redirectUri,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
      return false;
    }
  }
}

export const secureOAuthHandler = new SecureOAuthHandler();