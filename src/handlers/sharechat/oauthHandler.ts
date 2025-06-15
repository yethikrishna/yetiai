
import { ShareChatAuthCredentials, ShareChatSession } from '@/types/sharechat';

export class ShareChatOAuthHandler {
  private baseUrl = 'https://sharechat.com';
  private apiBaseUrl = 'https://sharechat.com/api/v2';

  async authenticate(credentials: ShareChatAuthCredentials): Promise<ShareChatSession> {
    try {
      // Step 1: Get CSRF token
      const csrfResponse = await fetch(`${this.baseUrl}/login`, {
        method: 'GET',
        headers: {
          'User-Agent': 'ShareChat/1.0 (Web)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (!csrfResponse.ok) {
        throw new Error('Failed to get CSRF token');
      }

      const csrfCookies = csrfResponse.headers.get('set-cookie') || '';
      const csrfToken = this.extractCsrfToken(csrfCookies);

      // Step 2: Login with credentials
      const loginResponse = await fetch(`${this.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'ShareChat/1.0 (Web)',
          'X-CSRF-Token': csrfToken,
          'Cookie': csrfCookies,
        },
        body: JSON.stringify({
          phone: credentials.phone,
          password: credentials.password,
        }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json().catch(() => ({}));
        throw new Error(errorData.message || 'Login failed');
      }

      const loginData = await loginResponse.json();
      const authCookies = loginResponse.headers.get('set-cookie') || '';

      // Step 3: Extract session information
      const sessionId = this.extractSessionId(authCookies);
      const authToken = loginData.access_token || loginData.token;

      if (!sessionId || !authToken) {
        throw new Error('Failed to extract session information');
      }

      const session: ShareChatSession = {
        session_id: sessionId,
        csrf_token: csrfToken,
        auth_token: authToken,
        user_id: loginData.user?.id || '',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };

      // Store session in localStorage
      this.storeSession(session);

      return session;
    } catch (error) {
      console.error('ShareChat authentication failed:', error);
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractCsrfToken(cookies: string): string {
    const match = cookies.match(/csrf_token=([^;]+)/);
    return match ? match[1] : '';
  }

  private extractSessionId(cookies: string): string {
    const match = cookies.match(/session_id=([^;]+)/);
    return match ? match[1] : '';
  }

  private storeSession(session: ShareChatSession): void {
    localStorage.setItem('sharechat_session', JSON.stringify(session));
  }

  public getStoredSession(): ShareChatSession | null {
    try {
      const stored = localStorage.getItem('sharechat_session');
      if (!stored) return null;

      const session = JSON.parse(stored) as ShareChatSession;
      
      // Check if session is expired
      if (new Date(session.expires_at) < new Date()) {
        this.clearStoredSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error retrieving stored session:', error);
      return null;
    }
  }

  public clearStoredSession(): void {
    localStorage.removeItem('sharechat_session');
  }

  async refreshSession(session: ShareChatSession): Promise<ShareChatSession> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.auth_token}`,
          'Content-Type': 'application/json',
          'User-Agent': 'ShareChat/1.0 (Web)',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to refresh session');
      }

      const data = await response.json();
      const refreshedSession: ShareChatSession = {
        ...session,
        auth_token: data.access_token || data.token,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      this.storeSession(refreshedSession);
      return refreshedSession;
    } catch (error) {
      console.error('Session refresh failed:', error);
      throw error;
    }
  }

  async revokeToken(authToken: string): Promise<void> {
    try {
      await fetch(`${this.apiBaseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'ShareChat/1.0 (Web)',
        },
      });
    } catch (error) {
      console.error('Token revocation failed:', error);
      // Don't throw - logout should succeed even if revocation fails
    }
  }
}
