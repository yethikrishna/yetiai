
import { githubPagesService } from '@/lib/github/githubPagesService';
import { ConnectionConfig } from '@/types/platform';

export const githubPagesHandler = {
  async connect(credentials: Record<string, string>): Promise<boolean> {
    try {
      console.log('Connecting to GitHub Pages...');
      
      // GitHub Pages uses the same credentials as GitHub
      if (!credentials.token) {
        throw new Error('GitHub token is required for GitHub Pages');
      }

      // Test the connection by trying to access GitHub API
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${credentials.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Yeti-Platform/1.0'
        }
      });

      if (!response.ok) {
        throw new Error('Invalid GitHub token for GitHub Pages');
      }

      console.log('GitHub Pages connection successful');
      return true;
    } catch (error) {
      console.error('GitHub Pages connection error:', error);
      return false;
    }
  },

  async disconnect(connection: ConnectionConfig): Promise<void> {
    console.log('Disconnecting from GitHub Pages...');
    // No specific cleanup needed for GitHub Pages
  },

  async test(connection: ConnectionConfig): Promise<boolean> {
    try {
      if (!connection.credentials.token) return false;
      
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${connection.credentials.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Yeti-Platform/1.0'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('GitHub Pages test connection error:', error);
      return false;
    }
  },

  // GitHub Pages-specific operations
  async getPagesStatus(connection: ConnectionConfig, owner: string, repo: string): Promise<any> {
    // This would use the githubPagesService but we need to adapt it for the handler pattern
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pages`, {
      headers: {
        'Authorization': `token ${connection.credentials.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Yeti-Platform/1.0'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `GitHub Pages API error: ${response.statusText}`);
    }

    return await response.json();
  },

  async enablePages(connection: ConnectionConfig, owner: string, repo: string, data: any): Promise<any> {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${connection.credentials.token}`,
        'Accept': 'application/vnd.github.switcheroo-preview+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Yeti-Platform/1.0'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `GitHub Pages API error: ${response.statusText}`);
    }

    return await response.json();
  }
};
