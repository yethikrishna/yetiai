import { ConnectionConfig } from "@/types/platform";

interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  clone_url: string;
  created_at: string;
  updated_at: string;
  stargazers_count: number;
  forks_count: number;
}

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
}

interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed' | 'merged';
  html_url: string;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
}

interface GitHubSearchResult {
  total_count: number;
  items: GitHubRepository[];
}

// Github OAuth2 config
const GITHUB_CLIENT_ID = "YOUR_SUPABASE_GITHUB_CLIENT_ID";
const REDIRECT_URI = `${window.location.origin}/oauth/callback/github`;

// Util: open OAuth popup (fallback to window.location if popup is blocked)
function startOAuthFlow() {
  const githubAuthUrl = `https://github.com/login/oauth/authorize` +
    `?client_id=${encodeURIComponent(GITHUB_CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=repo,user`;

  // Open in new window or redirect directly
  const w = window.open(githubAuthUrl, "_blank", "width=500,height=700");
  if (!w) window.location.href = githubAuthUrl;
}

class GitHubHandler {
  private baseUrl = 'https://api.github.com';

  async connect(credentials: Record<string, string>): Promise<boolean> {
    // If token is provided directly (API key flow)
    if (credentials.token) {
      try {
        const response = await fetch(`${this.baseUrl}/user`, {
          headers: {
            'Authorization': `token ${credentials.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Yeti-Platform/1.0'
          }
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Invalid GitHub token or connection failed');
        }

        const user = await response.json();
        console.log(`GitHub connection successful for user: ${user.login}`);
        return true;
      } catch (error) {
        console.error('GitHub connection failed:', error);
        throw new Error('Failed to connect to GitHub. Please check your Personal Access Token.');
      }
    }

    // Otherwise, trigger OAuth2 login (handled in ConnectionDialog)
    startOAuthFlow();
    return new Promise(() => {}); // Never resolves, user action completes in another call
  }

  async test(config: ConnectionConfig): Promise<boolean> {
    console.log("Testing GitHub connection...");
    
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          'Authorization': `token ${config.credentials.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Yeti-Platform/1.0'
        }
      });
      return response.ok;
    } catch (error) {
      console.error('GitHub test failed:', error);
      return false;
    }
  }

  async disconnect(config: ConnectionConfig): Promise<boolean> {
    console.log("Disconnecting from GitHub...");
    return true;
  }

  // READ Operations
  async getRepositories(
    token: string,
    options: {
      owner?: string;
      type?: 'all' | 'owner' | 'public' | 'private';
      sort?: 'created' | 'updated' | 'pushed' | 'full_name';
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<GitHubRepository[]> {
    const {
      owner,
      type = 'owner',
      sort = 'updated',
      per_page = 30,
      page = 1
    } = options;

    try {
      const url = owner 
        ? `${this.baseUrl}/users/${owner}/repos`
        : `${this.baseUrl}/user/repos`;

      const params = new URLSearchParams({
        type,
        sort,
        per_page: per_page.toString(),
        page: page.toString()
      });

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Yeti-Platform/1.0'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `GitHub API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GitHub get repositories failed:', error);
      throw error;
    }
  }

  async getRepository(token: string, owner: string, repo: string): Promise<GitHubRepository> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Yeti-Platform/1.0'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `GitHub API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GitHub get repository failed:', error);
      throw error;
    }
  }

  async getIssues(
    token: string,
    owner: string,
    repo: string,
    options: {
      state?: 'open' | 'closed' | 'all';
      sort?: 'created' | 'updated';
      direction?: 'asc' |'desc';
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<GitHubIssue[]> {
    const {
      state = 'open',
      sort = 'created',
      direction = 'desc',
      per_page = 30,
      page = 1
    } = options;

    try {
      const params = new URLSearchParams({
        state,
        sort,
        direction,
        per_page: per_page.toString(),
        page: page.toString()
      });

      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues?${params}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Yeti-Platform/1.0'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `GitHub API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GitHub get issues failed:', error);
      throw error;
    }
  }

  async getPullRequests(
    token: string,
    owner: string,
    repo: string,
    options: {
      state?: 'open' | 'closed' | 'all';
      sort?: 'created' | 'updated';
      direction?: 'asc' | 'desc';
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<GitHubPullRequest[]> {
    const {
      state = 'open',
      sort = 'created',
      direction = 'desc',
      per_page = 30,
      page = 1
    } = options;

    try {
      const params = new URLSearchParams({
        state,
        sort,
        direction,
        per_page: per_page.toString(),
        page: page.toString()
      });

      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/pulls?${params}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Yeti-Platform/1.0'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `GitHub API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GitHub get pull requests failed:', error);
      throw error;
    }
  }

  // WRITE Operations
  async createRepository(
    token: string,
    data: {
      name: string;
      description?: string;
      private?: boolean;
      auto_init?: boolean;
      gitignore_template?: string;
      license_template?: string;
    }
  ): Promise<GitHubRepository> {
    try {
      const response = await fetch(`${this.baseUrl}/user/repos`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Yeti-Platform/1.0'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `GitHub API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GitHub create repository failed:', error);
      throw error;
    }
  }

  async createIssue(
    token: string,
    owner: string,
    repo: string,
    data: {
      title: string;
      body?: string;
      assignees?: string[];
      labels?: string[];
    }
  ): Promise<GitHubIssue> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Yeti-Platform/1.0'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `GitHub API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GitHub create issue failed:', error);
      throw error;
    }
  }

  async createPullRequest(
    token: string,
    owner: string,
    repo: string,
    data: {
      title: string;
      head: string;
      base: string;
      body?: string;
      draft?: boolean;
    }
  ): Promise<GitHubPullRequest> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/pulls`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Yeti-Platform/1.0'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `GitHub API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GitHub create pull request failed:', error);
      throw error;
    }
  }

  // SEARCH Operations
  async searchRepositories(
    token: string,
    query: string,
    options: {
      sort?: 'stars' | 'forks' | 'help-wanted-issues' | 'updated';
      order?: 'desc' | 'asc';
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<GitHubSearchResult> {
    const {
      sort = 'stars',
      order = 'desc',
      per_page = 30,
      page = 1
    } = options;

    try {
      const params = new URLSearchParams({
        q: query,
        sort,
        order,
        per_page: per_page.toString(),
        page: page.toString()
      });

      const response = await fetch(`${this.baseUrl}/search/repositories?${params}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Yeti-Platform/1.0'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `GitHub API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GitHub search repositories failed:', error);
      throw error;
    }
  }

  async searchIssues(
    token: string,
    query: string,
    options: {
      sort?: 'comments' | 'reactions' | 'reactions-+1' | 'reactions--1' | 'reactions-smile' | 'reactions-thinking_face' | 'reactions-heart' | 'reactions-tada' | 'interactions' | 'created' | 'updated';
      order?: 'desc' | 'asc';
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<{ total_count: number; items: GitHubIssue[] }> {
    const {
      sort = 'created',
      order = 'desc',
      per_page = 30,
      page = 1
    } = options;

    try {
      const params = new URLSearchParams({
        q: query,
        sort,
        order,
        per_page: per_page.toString(),
        page: page.toString()
      });

      const response = await fetch(`${this.baseUrl}/search/issues?${params}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Yeti-Platform/1.0'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `GitHub API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GitHub search issues failed:', error);
      throw error;
    }
  }

  // Helper method to execute MCP-style commands
  async executeCommand(
    token: string,
    command: string,
    data: Record<string, any>
  ): Promise<any> {
    switch (command) {
      case 'search_repo':
        return await this.searchRepositories(token, data.keyword, data.options);
      
      case 'read_issues':
        const [owner, repo] = data.repo.split('/');
        return await this.getIssues(token, owner, repo, data.options);
      
      case 'create_issue':
        const [issueOwner, issueRepo] = data.repo.split('/');
        return await this.createIssue(token, issueOwner, issueRepo, {
          title: data.title,
          body: data.body,
          assignees: data.assignees,
          labels: data.labels
        });
      
      case 'create_repo':
        return await this.createRepository(token, data);
      
      case 'create_pr':
        const [prOwner, prRepo] = data.repo.split('/');
        return await this.createPullRequest(token, prOwner, prRepo, data);
      
      case 'get_repo':
        const [repoOwner, repoName] = data.repo.split('/');
        return await this.getRepository(token, repoOwner, repoName);
      
      case 'list_repos':
        return await this.getRepositories(token, data.options);
      
      case 'get_pulls':
        const [pullOwner, pullRepo] = data.repo.split('/');
        return await this.getPullRequests(token, pullOwner, pullRepo, data.options);
      
      case 'search_issues':
        return await this.searchIssues(token, data.query, data.options);
      
      default:
        throw new Error(`Unsupported GitHub command: ${command}`);
    }
  }
}

export const githubHandler = new GitHubHandler();
