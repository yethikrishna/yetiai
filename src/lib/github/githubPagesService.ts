
import { githubHandler } from '@/handlers/githubHandler';
import { Platform } from '@/types/platform';

export interface GitHubPagesInfo {
  url: string;
  status: string;
  cname: string | null;
  source: {
    branch: string;
    path: string;
  };
  build_type: string;
  protected_domain_state: string | null;
  pending_domain_unverified_at: string | null;
  custom_404: boolean;
  html_url: string;
  public: boolean;
}

export interface GitHubPagesCreateRequest {
  source: {
    branch: string;
    path?: string;
  };
  build_type?: 'legacy' | 'workflow';
}

export class GitHubPagesService {
  private getToken(connectedPlatforms: Platform[]): string | null {
    const githubPlatform = connectedPlatforms.find(p => p.id === 'github');
    if (!githubPlatform) return null;
    
    // In a real app, you'd get this from secure storage
    const connections = JSON.parse(localStorage.getItem('yeti-connections') || '[]');
    const connection = connections.find((c: any) => c.platformId === 'github');
    return connection?.credentials?.token || null;
  }

  // Read Operations
  async getPagesStatus(
    connectedPlatforms: Platform[],
    owner: string,
    repo: string
  ): Promise<GitHubPagesInfo> {
    const token = this.getToken(connectedPlatforms);
    if (!token) {
      throw new Error('GitHub not connected');
    }

    return await githubHandler.getPagesStatus(token, owner, repo);
  }

  async checkPagesEnabled(
    connectedPlatforms: Platform[],
    owner: string,
    repo: string
  ): Promise<boolean> {
    try {
      await this.getPagesStatus(connectedPlatforms, owner, repo);
      return true;
    } catch (error) {
      // If we get a 404, it means Pages is not enabled
      return false;
    }
  }

  // Write Operations
  async enablePages(
    connectedPlatforms: Platform[],
    owner: string,
    repo: string,
    source: {
      branch: string;
      path?: string;
    },
    buildType: 'legacy' | 'workflow' = 'legacy'
  ): Promise<GitHubPagesInfo> {
    const token = this.getToken(connectedPlatforms);
    if (!token) {
      throw new Error('GitHub not connected');
    }

    const data: GitHubPagesCreateRequest = {
      source: {
        branch: source.branch,
        path: source.path || '/'
      },
      build_type: buildType
    };

    return await githubHandler.enablePages(token, owner, repo, data);
  }

  async updatePages(
    connectedPlatforms: Platform[],
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
  ): Promise<GitHubPagesInfo> {
    const token = this.getToken(connectedPlatforms);
    if (!token) {
      throw new Error('GitHub not connected');
    }

    return await githubHandler.updatePages(token, owner, repo, updates);
  }

  async disablePages(
    connectedPlatforms: Platform[],
    owner: string,
    repo: string
  ): Promise<void> {
    const token = this.getToken(connectedPlatforms);
    if (!token) {
      throw new Error('GitHub not connected');
    }

    return await githubHandler.disablePages(token, owner, repo);
  }

  async setCustomDomain(
    connectedPlatforms: Platform[],
    owner: string,
    repo: string,
    domain: string
  ): Promise<GitHubPagesInfo> {
    return await this.updatePages(connectedPlatforms, owner, repo, {
      cname: domain
    });
  }

  // MCP-style command execution
  async executeCommand(
    connectedPlatforms: Platform[],
    command: string,
    data: Record<string, any>
  ): Promise<any> {
    const token = this.getToken(connectedPlatforms);
    if (!token) {
      throw new Error('GitHub not connected');
    }

    switch (command) {
      case 'read_pages_status':
        const [owner, repo] = data.repo.split('/');
        return await this.getPagesStatus(connectedPlatforms, owner, repo);
      
      case 'enable_pages':
        const [enableOwner, enableRepo] = data.repo.split('/');
        return await this.enablePages(
          connectedPlatforms,
          enableOwner,
          enableRepo,
          data.source || { branch: 'main' },
          data.build_type
        );
      
      case 'update_pages':
        const [updateOwner, updateRepo] = data.repo.split('/');
        return await this.updatePages(connectedPlatforms, updateOwner, updateRepo, data.updates);
      
      case 'disable_pages':
        const [disableOwner, disableRepo] = data.repo.split('/');
        return await this.disablePages(connectedPlatforms, disableOwner, disableRepo);
      
      case 'set_custom_domain':
        const [domainOwner, domainRepo] = data.repo.split('/');
        return await this.setCustomDomain(connectedPlatforms, domainOwner, domainRepo, data.domain);
      
      default:
        throw new Error(`Unsupported GitHub Pages command: ${command}`);
    }
  }

  // Helper methods for common operations
  async getMyPagesRepos(connectedPlatforms: Platform[]) {
    const token = this.getToken(connectedPlatforms);
    if (!token) {
      throw new Error('GitHub not connected');
    }

    // Get user's repositories and filter for those with Pages enabled
    const repos = await githubHandler.getRepositories(token, { type: 'owner' });
    const pagesRepos = [];

    for (const repo of repos) {
      const [owner, repoName] = repo.full_name.split('/');
      try {
        const pagesInfo = await this.getPagesStatus(connectedPlatforms, owner, repoName);
        pagesRepos.push({
          ...repo,
          pages: pagesInfo
        });
      } catch (error) {
        // Repository doesn't have Pages enabled, skip
      }
    }

    return pagesRepos;
  }

  async quickEnablePages(
    connectedPlatforms: Platform[],
    repoFullName: string,
    branch: string = 'main'
  ) {
    const [owner, repo] = repoFullName.split('/');
    return await this.enablePages(connectedPlatforms, owner, repo, { branch });
  }
}

export const githubPagesService = new GitHubPagesService();
