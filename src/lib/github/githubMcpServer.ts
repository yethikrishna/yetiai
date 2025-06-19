import { Platform } from "@/types/platform";
import { IMcpRequest, IMcpResponse, IMcpServer, McpServerType } from "@/lib/mcp/IMcpServer";
import { GitHubService } from "@/lib/github/githubService";

/**
 * GitHub implementation of the MCP server interface
 * Handles GitHub-specific actions through the Model Context Protocol
 */
export class GitHubMcpServer implements IMcpServer {
  private githubService: GitHubService;
  private executionHistory: Record<string, any[]> = {};

  constructor() {
    this.githubService = new GitHubService();
  }

  /**
   * Executes a GitHub-specific request
   */
  async executeRequest(request: IMcpRequest, connectedPlatforms: Platform[]): Promise<IMcpResponse> {
    const { action, parameters, userId } = request;
    
    try {
      let result;
      let executionLog = `Executing GitHub action: ${action}`;
      
      // Store this execution in history
      if (!this.executionHistory[userId]) {
        this.executionHistory[userId] = [];
      }
      
      // Execute the appropriate GitHub action
      switch (action) {
        case 'getRepositories':
          executionLog += `\nFetching repositories with options: ${JSON.stringify(parameters.options || {})}`;
          result = await this.githubService.getRepositories(connectedPlatforms, parameters.options);
          break;
          
        case 'getRepository':
          executionLog += `\nFetching repository: ${parameters.owner}/${parameters.repo}`;
          result = await this.githubService.getRepository(
            connectedPlatforms,
            parameters.owner,
            parameters.repo
          );
          break;
          
        case 'createRepository':
          executionLog += `\nCreating repository: ${parameters.data.name}`;
          result = await this.githubService.createRepository(
            connectedPlatforms,
            parameters.data
          );
          break;
          
        case 'getIssues':
          executionLog += `\nFetching issues for ${parameters.owner}/${parameters.repo}`;
          result = await this.githubService.getIssues(
            connectedPlatforms,
            parameters.owner,
            parameters.repo,
            parameters.options
          );
          break;
          
        case 'createIssue':
          executionLog += `\nCreating issue in ${parameters.owner}/${parameters.repo}: ${parameters.data.title}`;
          result = await this.githubService.createIssue(
            connectedPlatforms,
            parameters.owner,
            parameters.repo,
            parameters.data
          );
          break;
          
        case 'getPullRequests':
          executionLog += `\nFetching pull requests for ${parameters.owner}/${parameters.repo}`;
          result = await this.githubService.getPullRequests(
            connectedPlatforms,
            parameters.owner,
            parameters.repo,
            parameters.options
          );
          break;
          
        case 'createPullRequest':
          executionLog += `\nCreating pull request in ${parameters.owner}/${parameters.repo}: ${parameters.data.title}`;
          result = await this.githubService.createPullRequest(
            connectedPlatforms,
            parameters.owner,
            parameters.repo,
            parameters.data
          );
          break;
          
        default:
          return {
            success: false,
            error: `Unsupported GitHub action: ${action}`,
            executionLog: `Error: Unsupported GitHub action: ${action}`
          };
      }
      
      // Record the execution
      this.executionHistory[userId].push({
        timestamp: new Date().toISOString(),
        action,
        platform: 'github',
        parameters,
        result
      });
      
      // Limit history length
      if (this.executionHistory[userId].length > 100) {
        this.executionHistory[userId] = this.executionHistory[userId].slice(-100);
      }
      
      return {
        success: true,
        data: result,
        executionLog
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Record failed execution
      if (this.executionHistory[userId]) {
        this.executionHistory[userId].push({
          timestamp: new Date().toISOString(),
          action,
          platform: 'github',
          parameters,
          error: errorMessage
        });
      }
      
      return {
        success: false,
        error: errorMessage,
        executionLog: `Error while executing GitHub action ${action}: ${errorMessage}`
      };
    }
  }

  /**
   * Gets the execution history for a user
   */
  async getExecutionHistory(userId: string, limit?: number, platform?: string): Promise<any[]> {
    const history = this.executionHistory[userId] || [];
    
    // Filter by platform if specified
    const filteredHistory = platform 
      ? history.filter(item => item.platform === platform)
      : history;
      
    // Apply limit if specified
    return limit 
      ? filteredHistory.slice(-limit)
      : filteredHistory;
  }

  /**
   * Checks if the platform is supported by this MCP server
   */
  supportsPlatform(platformId: string): boolean {
    return platformId === 'github';
  }

  /**
   * Gets the type of this MCP server
   */
  getServerType(): string {
    return McpServerType.GITHUB;
  }
}

// Create and export a singleton instance
export const githubMcpServer = new GitHubMcpServer();

// Export as default
export default githubMcpServer;