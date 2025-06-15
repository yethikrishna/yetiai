
import { KooAuthCredentials, KooSession, KooTokens, KooApiResponse } from '@/types/koo';

export class KooOAuthHandler {
  private baseUrl = 'https://www.kooapp.com';

  async authenticate(credentials: KooAuthCredentials): Promise<KooSession> {
    console.log('Starting Koo authentication...');

    try {
      // Step 1: Get CSRF token from login page
      const loginPageResponse = await fetch(`${this.baseUrl}/accounts/login/`, {
        credentials: 'include',
      });

      if (!loginPageResponse.ok) {
        throw new Error('Failed to load login page');
      }

      const loginPageHtml = await loginPageResponse.text();
      const csrfMatch = loginPageHtml.match(/name="csrfmiddlewaretoken" value="([^"]+)"/);
      
      if (!csrfMatch) {
        throw new Error('Could not extract CSRF token');
      }

      const csrfToken = csrfMatch[1];

      // Step 2: Perform login
      const loginData = new FormData();
      loginData.append('csrfmiddlewaretoken', csrfToken);
      loginData.append('login', credentials.email);
      loginData.append('password', credentials.password);

      const loginResponse = await fetch(`${this.baseUrl}/accounts/login/`, {
        method: 'POST',
        body: loginData,
        credentials: 'include',
        headers: {
          'Referer': `${this.baseUrl}/accounts/login/`,
        },
      });

      // Step 3: Extract session information
      const cookies = loginResponse.headers.get('set-cookie') || '';
      const sessionMatch = cookies.match(/sessionid=([^;]+)/);
      
      if (!sessionMatch) {
        throw new Error('Login failed - no session cookie received');
      }

      const sessionId = sessionMatch[1];

      // Step 4: Get user ID from profile redirect or API
      const profileResponse = await fetch(`${this.baseUrl}/api/profile/me/`, {
        headers: {
          'Cookie': `sessionid=${sessionId}`,
          'X-CSRFToken': csrfToken,
        },
      });

      let userId = '';
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        userId = profileData.id || profileData.user_id || '';
      }

      // Create session object
      const session: KooSession = {
        session_id: sessionId,
        csrf_token: csrfToken,
        user_id: userId,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      };

      console.log('Koo authentication successful');
      return session;

    } catch (error) {
      console.error('Koo authentication failed:', error);
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async validateSession(session: KooSession): Promise<boolean> {
    try {
      // Check if session is expired
      if (new Date() > new Date(session.expires_at)) {
        return false;
      }

      // Test the session with a simple API call
      const response = await fetch(`${this.baseUrl}/api/profile/me/`, {
        headers: {
          'Cookie': `sessionid=${session.session_id}`,
          'X-CSRFToken': session.csrf_token,
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }

  async refreshSession(session: KooSession): Promise<KooSession> {
    // For Koo's session-based auth, we might need to re-authenticate
    // This is a placeholder - in practice, you might need to implement
    // a refresh mechanism based on Koo's specific requirements
    throw new Error('Session refresh not implemented - please re-authenticate');
  }

  sessionToTokens(session: KooSession): KooTokens {
    return {
      session_id: session.session_id,
      csrf_token: session.csrf_token,
      user_id: session.user_id,
    };
  }
}
