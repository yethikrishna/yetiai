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
    console.log('GitHub connect called with credentials:', { 
      hasToken: !!credentials.token,
      tokenLength: credentials.token?.length || 0,
      tokenPrefix: credentials.token?.substring(0, 4) || 'none'
    });
    
    // If token is provided directly (API key flow)
    if (credentials.token) {
      try {
        console.log('Attempting to verify GitHub token...');
        
        // Validate token format first
        const token = credentials.token.trim();
        if (!token.startsWith('ghp_') && !token.startsWith('github_pat_') && !token.startsWith('gho_') && !token.startsWith('ghu_') && !token.startsWith('ghs_') && !token.startsWith('ghr_')) {
          console.error('Invalid token format detected');
          throw new Error('Invalid GitHub token format. Personal Access Tokens should start with "ghp_", "github_pat_", or other valid prefixes.');
        }
        
        console.log('Token format appears valid, making API request...');
        
        const response = await fetch(`${this.baseUrl}/user`, {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Yeti-Platform/1.0'
          }
        });

        console.log('GitHub API response:', {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });

        if (!response.ok) {
          let errorMessage = 'Invalid GitHub token or connection failed';
          let detailedError = '';
          
          try {
            const errorData = await response.json();
            detailedError = JSON.stringify(errorData, null, 2);
            console.log('GitHub API error response:', errorData);
          } catch (parseError) {
            console.log('Could not parse error response as JSON');
            try {
              detailedError = await response.text();
              console.log('GitHub API error response (text):', detailedError);
            } catch (textError) {
              console.log('Could not parse error response as text either');
            }
          }
          
          if (response.status === 401) {
            errorMessage = 'Invalid GitHub Personal Access Token. Please verify:\n1. The token is correct and not expired\n2. The token has the required scopes (repo, user)\n3. You have copied the entire token without extra spaces';
          } else if (response.status === 403) {
            errorMessage = 'GitHub API access forbidden. This could be due to:\n1. Rate limit exceeded\n2. Token has insufficient permissions\n3. Organization restrictions';
          } else if (response.status === 404) {
            errorMessage = 'GitHub API endpoint not found. Please check your token format and ensure it\'s a valid Personal Access Token.';
          } else {
            errorMessage = `GitHub API error (${response.status}): ${response.statusText}`;
            if (detailedError) {
              errorMessage += `\nDetails: ${detailedError}`;
            }
          }
          
          console.error('GitHub connection failed with status:', response.status, errorMessage);
          throw new Error(errorMessage);
        }

        const user = await response.json();
        console.log('GitHub connection successful!', {
          username: user.login,
          id: user.id,
          name: user.name,
          publicRepos: user.public_repos
        });
        return true;
      } catch (error) {
        console.error('GitHub connection error caught:', error);
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('Network error: Unable to connect to GitHub API. Please check your internet connection.');
        }
        
        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error('An unexpected error occurred while connecting to GitHub. Please try again.');
        }
      }
    }

    // For OAuth flow, we need to show a message that OAuth is not yet fully configured
    throw new Error('GitHub OAuth is not yet configured. Please use a Personal Access Token for now. You can create one at: https://github.com/settings/tokens');
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

  // GitHub Pages Operations
  async getPagesStatus(token: string, owner: string, repo: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/pages`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Yeti-Platform/1.0'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `GitHub Pages API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GitHub get pages status failed:', error);
      throw error;
    }
  }

  async enablePages(
    token: string,
    owner: string,
    repo: string,
    data: {
      source: {
        branch: string;
        path?: string;
      };
      build_type?: 'legacy' | 'workflow';
    }
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/pages`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
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
    } catch (error) {
      console.error('GitHub enable pages failed:', error);
      throw error;
    }
  }

  async updatePages(
    token: string,
    owner: string,
    repo: string,
    updates: {
      source?: {
        branch: string;
        path?: string;
      };
      cname?: string;
      build_type?: 'legacy' | 'workflow';
    }
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/pages`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.switcheroo-preview+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Yeti-Platform/1.0'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `GitHub Pages API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GitHub update pages failed:', error);
      throw error;
    }
  }

  async disablePages(token: string, owner: string, repo: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/pages`, {
        method: 'DELETE',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Yeti-Platform/1.0'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `GitHub Pages API error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('GitHub disable pages failed:', error);
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

  // Advanced automation methods for Yeti Agent
  async createFullProject(
    token: string,
    projectConfig: {
      name: string;
      description?: string;
      template?: 'react' | 'nextjs' | 'vue' | 'vanilla';
      private?: boolean;
      enablePages?: boolean;
      addReadme?: boolean;
      license?: string;
    }
  ): Promise<any> {
    console.log('🚀 Creating full project with GitHub automation:', projectConfig);
    
    // Step 1: Create repository
    const repo = await this.createRepository(token, {
      name: projectConfig.name,
      description: projectConfig.description || `Project created by Yeti AI Agent`,
      private: projectConfig.private || false,
      auto_init: true,
      license_template: projectConfig.license || 'mit'
    });

    console.log('✅ Repository created:', repo.full_name);

    // Step 2: Add template files if specified
    if (projectConfig.template && projectConfig.template !== 'vanilla') {
      await this.addTemplateFiles(token, repo.owner.login, repo.name, projectConfig.template);
    }

    // Step 3: Enable GitHub Pages if requested
    if (projectConfig.enablePages) {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for repo to be ready
        const pagesResult = await this.enablePages(token, repo.owner.login, repo.name, {
          source: { branch: 'main', path: '/' },
          build_type: 'workflow'
        });
        console.log('✅ GitHub Pages enabled:', pagesResult);
      } catch (error) {
        console.warn('⚠️ Could not enable GitHub Pages immediately, might need manual setup:', error);
      }
    }

    return {
      repository: repo,
      pagesEnabled: projectConfig.enablePages,
      template: projectConfig.template
    };
  }

  async addTemplateFiles(token: string, owner: string, repo: string, template: string): Promise<void> {
    console.log(`📝 Adding ${template} template files to ${owner}/${repo}`);
    
    const templates: Record<string, { files: Record<string, string> }> = {
      react: {
        files: {
          'package.json': JSON.stringify({
            "name": repo,
            "version": "1.0.0",
            "scripts": {
              "dev": "vite",
              "build": "vite build",
              "preview": "vite preview"
            },
            "dependencies": {
              "react": "^18.2.0",
              "react-dom": "^18.2.0"
            },
            "devDependencies": {
              "vite": "^4.4.0",
              "@vitejs/plugin-react": "^4.0.0"
            }
          }, null, 2),
          'src/App.jsx': `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <h1>Welcome to ${repo}</h1>
      <p>Created by Yeti AI Agent 🤖</p>
    </div>
  );
}

export default App;`,
          'src/main.jsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
          'index.html': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${repo}</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`,
          'vite.config.js': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});`
        }
      },
      nextjs: {
        files: {
          'package.json': JSON.stringify({
            "name": repo,
            "version": "1.0.0",
            "scripts": {
              "dev": "next dev",
              "build": "next build",
              "start": "next start"
            },
            "dependencies": {
              "next": "^14.0.0",
              "react": "^18.2.0",
              "react-dom": "^18.2.0"
            }
          }, null, 2),
          'pages/index.js': `export default function Home() {
  return (
    <div>
      <h1>Welcome to ${repo}</h1>
      <p>Created by Yeti AI Agent 🤖</p>
    </div>
  );
}`
        }
      }
    };

    const templateConfig = templates[template];
    if (!templateConfig) return;

    // Add files one by one
    for (const [filePath, content] of Object.entries(templateConfig.files)) {
      try {
        await this.createOrUpdateFile(token, owner, repo, filePath, content, `Add ${filePath} template file`);
        console.log(`✅ Added template file: ${filePath}`);
      } catch (error) {
        console.warn(`⚠️ Could not add template file ${filePath}:`, error);
      }
    }
  }

  async createOrUpdateFile(
    token: string,
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string
  ): Promise<any> {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`;
    const contentBase64 = btoa(unescape(encodeURIComponent(content)));

    // Check if file exists first
    let sha: string | undefined;
    try {
      const existingFile = await fetch(url, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Yeti-Platform/1.0'
        }
      });
      
      if (existingFile.ok) {
        const fileData = await existingFile.json();
        sha = fileData.sha;
      }
    } catch (error) {
      // File doesn't exist, we'll create it
    }

    const body: any = {
      message,
      content: contentBase64
    };

    if (sha) {
      body.sha = sha;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'Yeti-Platform/1.0'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `GitHub API error: ${response.statusText}`);
    }

    return await response.json();
  }

  async setupWorkflow(
    token: string,
    owner: string,
    repo: string,
    workflowType: 'ci' | 'deploy' | 'pages'
  ): Promise<any> {
    console.log(`⚙️ Setting up ${workflowType} workflow for ${owner}/${repo}`);
    
    const workflows: Record<string, string> = {
      ci: `name: CI
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm install
    - name: Build
      run: npm run build`,
      
      deploy: `name: Deploy
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    - name: Install dependencies
      run: npm install
    - name: Build
      run: npm run build
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: \${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./dist`,
        
      pages: `name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v3
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v2`
    };

    const workflowContent = workflows[workflowType];
    if (!workflowContent) {
      throw new Error(`Unknown workflow type: ${workflowType}`);
    }

    return await this.createOrUpdateFile(
      token,
      owner,
      repo,
      `.github/workflows/${workflowType}.yml`,
      workflowContent,
      `Add ${workflowType} workflow`
    );
  }

  async generateProjectIdeas(token: string, topic: string): Promise<any> {
    console.log(`💡 Generating project ideas for topic: ${topic}`);
    
    // In a real implementation, this would use AI to generate ideas
    const ideas = [
      {
        name: `${topic}-dashboard`,
        description: `Interactive dashboard for ${topic} data visualization`,
        template: 'react' as const,
        features: ['Data visualization', 'Real-time updates', 'Responsive design']
      },
      {
        name: `${topic}-api`,
        description: `RESTful API for ${topic} data management`,
        template: 'vanilla' as const,
        features: ['REST endpoints', 'Database integration', 'Authentication']
      },
      {
        name: `${topic}-blog`,
        description: `Blog website focused on ${topic}`,
        template: 'nextjs' as const,
        features: ['Static site generation', 'SEO optimization', 'Content management']
      }
    ];

    return { ideas, topic };
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
        return await this.createRepository(token, {
          name: data.name,
          description: data.description,
          private: data.private,
          auto_init: data.auto_init,
          gitignore_template: data.gitignore_template,
          license_template: data.license_template
        });
      
      case 'create_pr':
        const [prOwner, prRepo] = data.repo.split('/');
        return await this.createPullRequest(token, prOwner, prRepo, {
          title: data.title,
          head: data.head,
          base: data.base,
          body: data.body,
          draft: data.draft
        });
      
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

      // GitHub Pages commands
      case 'read_pages_status':
        const [pagesOwner, pagesRepo] = data.repo.split('/');
        return await this.getPagesStatus(token, pagesOwner, pagesRepo);
      
      case 'enable_pages':
        const [enableOwner, enableRepo] = data.repo.split('/');
        const enableData = {
          source: data.source || { branch: 'main' },
          build_type: data.build_type
        };
        return await this.enablePages(token, enableOwner, enableRepo, enableData);
      
      case 'update_pages':
        const [updateOwner, updateRepo] = data.repo.split('/');
        return await this.updatePages(token, updateOwner, updateRepo, data.updates);
      
      case 'disable_pages':
        const [disableOwner, disableRepo] = data.repo.split('/');
        return await this.disablePages(token, disableOwner, disableRepo);
      
      default:
        throw new Error(`Unsupported GitHub command: ${command}`);
    }
  }
}

export const githubHandler = new GitHubHandler();
