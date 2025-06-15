
import { githubHandler } from '@/handlers/githubHandler';
import { Platform } from '@/types/platform';

export class GitHubService {
  private getToken(connectedPlatforms: Platform[]): string | null {
    const githubPlatform = connectedPlatforms.find(p => p.id === 'github');
    if (!githubPlatform) return null;
    
    // In a real app, you'd get this from secure storage
    const connections = JSON.parse(localStorage.getItem('yeti-connections') || '[]');
    const connection = connections.find((c: any) => c.platformId === 'github');
    return connection?.credentials?.token || null;
  }

  // Repository Operations
  async getRepositories(
    connectedPlatforms: Platform[],
    options?: {
      owner?: string;
      type?: 'all' | 'owner' | 'public' | 'private';
      sort?: 'created' | 'updated' | 'pushed' | 'full_name';
      per_page?: number;
      page?: number;
    }
  ) {
    const token = this.getToken(connectedPlatforms);
    if (!token) {
      throw new Error('GitHub not connected');
    }

    return await githubHandler.getRepositories(token, options);
  }

  async getRepository(
    connectedPlatforms: Platform[],
    owner: string,
    repo: string
  ) {
    const token = this.getToken(connectedPlatforms);
    if (!token) {
      throw new Error('GitHub not connected');
    }

    return await githubHandler.getRepository(token, owner, repo);
  }

  async createRepository(
    connectedPlatforms: Platform[],
    data: {
      name: string;
      description?: string;
      private?: boolean;
      auto_init?: boolean;
      gitignore_template?: string;
      license_template?: string;
    }
  ) {
    const token = this.getToken(connectedPlatforms);
    if (!token) {
      throw new Error('GitHub not connected');
    }

    return await githubHandler.createRepository(token, data);
  }

  // Issues Operations
  async getIssues(
    connectedPlatforms: Platform[],
    owner: string,
    repo: string,
    options?: {
      state?: 'open' | 'closed' | 'all';
      sort?: 'created' | 'updated';
      direction?: 'asc' | 'desc';
      per_page?: number;
      page?: number;
    }
  ) {
    const token = this.getToken(connectedPlatforms);
    if (!token) {
      throw new Error('GitHub not connected');
    }

    return await githubHandler.getIssues(token, owner, repo, options);
  }

  async createIssue(
    connectedPlatforms: Platform[],
    owner: string,
    repo: string,
    data: {
      title: string;
      body?: string;
      assignees?: string[];
      labels?: string[];
    }
  ) {
    const token = this.getToken(connectedPlatforms);
    if (!token) {
      throw new Error('GitHub not connected');
    }

    return await githubHandler.createIssue(token, owner, repo, data);
  }

  // Pull Requests Operations
  async getPullRequests(
    connectedPlatforms: Platform[],
    owner: string,
    repo: string,
    options?: {
      state?: 'open' | 'closed' | 'all';
      sort?: 'created' | 'updated';
      direction?: 'asc' | 'desc';
      per_page?: number;
      page?: number;
    }
  ) {
    const token = this.getToken(connectedPlatforms);
    if (!token) {
      throw new Error('GitHub not connected');
    }

    return await githubHandler.getPullRequests(token, owner, repo, options);
  }

  async createPullRequest(
    connectedPlatforms: Platform[],
    owner: string,
    repo: string,
    data: {
      title: string;
      head: string;
      base: string;
      body?: string;
      draft?: boolean;
    }
  ) {
    const token = this.getToken(connectedPlatforms);
    if (!token) {
      throw new Error('GitHub not connected');
    }

    return await githubHandler.createPullRequest(token, owner, repo, data);
  }

  // Search Operations
  async searchRepositories(
    connectedPlatforms: Platform[],
    query: string,
    options?: {
      sort?: 'stars' | 'forks' | 'help-wanted-issues' | 'updated';
      order?: 'desc' | 'asc';
      per_page?: number;
      page?: number;
    }
  ) {
    const token = this.getToken(connectedPlatforms);
    if (!token) {
      throw new Error('GitHub not connected');
    }

    return await githubHandler.searchRepositories(token, query, options);
  }

  async searchIssues(
    connectedPlatforms: Platform[],
    query: string,
    options?: {
      sort?: 'comments' | 'reactions' | 'created' | 'updated';
      order?: 'desc' | 'asc';
      per_page?: number;
      page?: number;
    }
  ) {
    const token = this.getToken(connectedPlatforms);
    if (!token) {
      throw new Error('GitHub not connected');
    }

    return await githubHandler.searchIssues(token, query, options);
  }

  // MCP-style command execution
  async executeCommand(
    connectedPlatforms: Platform[],
    command: string,
    data: Record<string, any>
  ) {
    const token = this.getToken(connectedPlatforms);
    if (!token) {
      throw new Error('GitHub not connected');
    }

    return await githubHandler.executeCommand(token, command, data);
  }

  // Helper methods for common operations
  async getMyRepositories(connectedPlatforms: Platform[]) {
    return await this.getRepositories(connectedPlatforms, { type: 'owner' });
  }

  async getRepoIssues(connectedPlatforms: Platform[], repoFullName: string) {
    const [owner, repo] = repoFullName.split('/');
    return await this.getIssues(connectedPlatforms, owner, repo);
  }

  async createBugReport(
    connectedPlatforms: Platform[],
    repoFullName: string,
    title: string,
    description: string
  ) {
    const [owner, repo] = repoFullName.split('/');
    return await this.createIssue(connectedPlatforms, owner, repo, {
      title,
      body: description,
      labels: ['bug']
    });
  }

  async searchMyRepos(connectedPlatforms: Platform[], keyword: string) {
    const token = this.getToken(connectedPlatforms);
    if (!token) {
      throw new Error('GitHub not connected');
    }

    // Search repositories owned by the authenticated user
    return await this.searchRepositories(connectedPlatforms, `${keyword} user:@me`);
  }
}

export const githubService = new GitHubService();
