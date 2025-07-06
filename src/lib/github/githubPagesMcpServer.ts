
import { IMcpServer, IMcpRequest, IMcpResponse, McpServerType } from '../mcp/IMcpServer';
import { Platform } from '@/types/platform';
import { GitHubPagesService } from './githubPagesService';

interface ExecutionRecord {
  timestamp: Date;
  action: string;
  platform: string;
  parameters: Record<string, any>;
  status: string;
  result?: any;
  error?: string;
}

class GithubPagesMcpServer implements IMcpServer {
  private static instance: GithubPagesMcpServer;
  private githubPagesService: GitHubPagesService;
  private executionHistory: Record<string, ExecutionRecord[]> = {};

  private constructor() {
    this.githubPagesService = new GitHubPagesService();
  }

  public static getInstance(): GithubPagesMcpServer {
    if (!GithubPagesMcpServer.instance) {
      GithubPagesMcpServer.instance = new GithubPagesMcpServer();
    }
    return GithubPagesMcpServer.instance;
  }

  async executeRequest(request: IMcpRequest, connectedPlatforms: Platform[]): Promise<IMcpResponse> {
    console.log(`[GithubPagesMcpServer] Executing request: ${request.action}`);

    // Store execution for history
    if (!this.executionHistory[request.userId]) {
      this.executionHistory[request.userId] = [];
    }

    const executionRecord: ExecutionRecord = {
      timestamp: new Date(),
      action: request.action,
      platform: request.platform,
      parameters: request.parameters,
      status: 'pending'
    };

    this.executionHistory[request.userId].unshift(executionRecord);

    try {
      // Validate that we're dealing with a GitHub Pages request
      if (!this.supportsPlatform(request.platform)) {
        throw new Error(`Platform ${request.platform} not supported by GitHub Pages MCP server`);
      }

      let result;
      const { owner, repo } = request.parameters;
      
      // Handle different GitHub Pages actions
      switch (request.action) {
        case 'getPagesStatus':
          result = await this.githubPagesService.getPagesStatus(connectedPlatforms, owner, repo);
          break;

        case 'checkPagesEnabled':
          result = await this.githubPagesService.checkPagesEnabled(connectedPlatforms, owner, repo);
          break;

        case 'enablePages':
          const { source, buildType } = request.parameters;
          result = await this.githubPagesService.enablePages(
            connectedPlatforms, 
            owner, 
            repo, 
            source, 
            buildType
          );
          break;

        case 'updatePages':
          const { updates } = request.parameters;
          result = await this.githubPagesService.updatePages(
            connectedPlatforms,
            owner,
            repo,
            updates
          );
          break;

        case 'disablePages':
          await this.githubPagesService.disablePages(connectedPlatforms, owner, repo);
          result = { success: true };
          break;

        case 'setCustomDomain':
          const { domain } = request.parameters;
          result = await this.githubPagesService.setCustomDomain(
            connectedPlatforms,
            owner,
            repo,
            domain
          );
          break;

        default:
          throw new Error(`Unknown action: ${request.action}`);
      }

      // Update history with success
      executionRecord.status = 'success';
      executionRecord.result = result;

      return {
        success: true,
        data: result,
        executionLog: `Successfully executed GitHub Pages action: ${request.action}`
      };
    } catch (error) {
      console.error(`[GithubPagesMcpServer] Error executing request:`, error);
      
      // Update history with error
      executionRecord.status = 'error';
      executionRecord.error = error.message;

      return {
        success: false,
        error: error.message,
        executionLog: `Error executing GitHub Pages action: ${error.message}`
      };
    }
  }

  async getExecutionHistory(userId: string, limit?: number, platform?: string): Promise<any[]> {
    const history = this.executionHistory[userId] || [];
    
    // Filter by platform if specified
    const filteredHistory = platform 
      ? history.filter(item => item.platform === platform)
      : history;

    // Apply limit if specified
    return limit ? filteredHistory.slice(0, limit) : filteredHistory;
  }

  supportsPlatform(platformId: string): boolean {
    return platformId === 'github_pages';
  }

  getServerType(): string {
    return McpServerType.GITHUB_PAGES;
  }
}

// Export a singleton instance
export const githubPagesMcpServer = GithubPagesMcpServer.getInstance();
