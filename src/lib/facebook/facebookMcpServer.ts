
import { IMcpServer, IMcpRequest, IMcpResponse, McpServerType } from '../mcp/IMcpServer';
import { Platform } from '@/types/platform';
import { facebookHandler } from '@/handlers/facebook';
import { facebookApiClient } from '@/handlers/facebook/apiClient';
import { facebookOAuthHandler } from '@/handlers/facebook/oauthHandler';
import { FacebookApiResponse, FacebookPageToken } from '@/types/facebook';

interface ExecutionRecord {
  timestamp: Date;
  action: string;
  platform: string;
  parameters: Record<string, any>;
  status: string;
  result?: any;
  error?: string;
}

class FacebookMcpServer implements IMcpServer {
  private static instance: FacebookMcpServer;
  private executionHistory: Record<string, ExecutionRecord[]> = {};

  private constructor() {}

  public static getInstance(): FacebookMcpServer {
    if (!FacebookMcpServer.instance) {
      FacebookMcpServer.instance = new FacebookMcpServer();
    }
    return FacebookMcpServer.instance;
  }

  private getAccessTokenForPage(pageId: string): string | null {
    const pages = facebookOAuthHandler.getStoredPages();
    const page = pages.find(p => p.id === pageId);
    return page ? page.access_token : null;
  }

  async executeRequest(request: IMcpRequest, connectedPlatforms: Platform[]): Promise<IMcpResponse> {
    console.log(`[FacebookMcpServer] Executing request: ${request.action}`);

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
      // Validate that we're dealing with a Facebook request
      if (!this.supportsPlatform(request.platform)) {
        throw new Error(`Platform ${request.platform} not supported by Facebook MCP server`);
      }

      // Check if Facebook is connected/authenticated
      const tokens = facebookOAuthHandler.getStoredTokens();
      if (!tokens && request.action !== 'connect') {
        throw new Error('Facebook not connected. Please connect your Facebook account first.');
      }

      let result;
      
      // Handle different Facebook actions
      switch (request.action) {
        case 'connect':
          const { appId, appSecret } = request.parameters;
          result = await facebookHandler.connect({ appId, appSecret });
          break;

        case 'disconnect':
          await facebookHandler.disconnect({
            id: 'facebook-connection',
            platformId: 'facebook',
            credentials: {},
            settings: {},
            isActive: true
          });
          result = { success: true };
          break;

        case 'test':
          result = await facebookHandler.test({
            id: 'facebook-connection',
            platformId: 'facebook',
            credentials: {},
            settings: {},
            isActive: true
          });
          break;

        case 'getAvailablePages':
          result = await facebookHandler.getAvailablePages();
          break;

        case 'postToPage':
          const { pageId, message, imageFile } = request.parameters;
          result = await facebookHandler.postToPage(pageId, message, imageFile);
          break;

        case 'getPagePosts':
          const { pageId: postsPageId, limit = 25 } = request.parameters;
          result = await facebookHandler.getPagePosts(postsPageId, limit);
          break;

        case 'getPostComments':
          const { postId, pageId: commentsPageId, commentLimit = 25 } = request.parameters;
          result = await facebookHandler.getPostComments(postId, commentsPageId, commentLimit);
          break;

        case 'replyToComment':
          const { commentId, pageId: replyPageId, replyMessage } = request.parameters;
          result = await facebookHandler.replyToComment(commentId, replyPageId, replyMessage);
          break;

        case 'deletePost':
          const { postId: deletePostId, pageId: deletePageId } = request.parameters;
          result = await facebookHandler.deletePost(deletePostId, deletePageId);
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
        executionLog: `Successfully executed Facebook action: ${request.action}`
      };
    } catch (error) {
      console.error(`[FacebookMcpServer] Error executing request:`, error);
      
      // Update history with error
      executionRecord.status = 'error';
      executionRecord.error = error.message;

      return {
        success: false,
        error: error.message,
        executionLog: `Error executing Facebook action: ${error.message}`
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
    return platformId === 'facebook';
  }

  getServerType(): string {
    return McpServerType.FACEBOOK;
  }
}

// Export a singleton instance
export const facebookMcpServer = FacebookMcpServer.getInstance();
