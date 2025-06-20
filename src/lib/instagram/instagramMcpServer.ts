
import { IMcpServer, IMcpRequest, IMcpResponse, McpServerType } from '../mcp/IMcpServer';
import { Platform } from '@/types/platform';
import { instagramHandler } from '@/handlers/instagram';
import { InstagramApiClient } from '@/handlers/instagram/apiClient';
import { InstagramPost, InstagramAccount } from '@/types/instagram';

interface ExecutionRecord {
  timestamp: Date;
  action: string;
  platform: string;
  parameters: Record<string, any>;
  status: string;
  result?: any;
  error?: string;
}

class InstagramMcpServer implements IMcpServer {
  private static instance: InstagramMcpServer;
  private executionHistory: Record<string, ExecutionRecord[]> = {};

  private constructor() {}

  public static getInstance(): InstagramMcpServer {
    if (!InstagramMcpServer.instance) {
      InstagramMcpServer.instance = new InstagramMcpServer();
    }
    return InstagramMcpServer.instance;
  }

  private getClientFromPlatforms(connectedPlatforms: Platform[]): InstagramApiClient | null {
    const stored = localStorage.getItem('instagram-tokens');
    if (!stored) return null;

    const tokens = JSON.parse(stored);
    return new InstagramApiClient(tokens.pageAccessToken, tokens.instagramAccountId);
  }

  async executeRequest(request: IMcpRequest, connectedPlatforms: Platform[]): Promise<IMcpResponse> {
    console.log(`[InstagramMcpServer] Executing request: ${request.action}`);

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
      // Validate that we're dealing with an Instagram request
      if (!this.supportsPlatform(request.platform)) {
        throw new Error(`Platform ${request.platform} not supported by Instagram MCP server`);
      }

      const client = this.getClientFromPlatforms(connectedPlatforms);
      if (!client) {
        throw new Error('Instagram not connected. Please connect your Instagram account first.');
      }

      let result;
      
      // Handle different Instagram actions
      switch (request.action) {
        case 'getPosts':
          const { limit = 10 } = request.parameters;
          result = await instagramHandler.getPosts(limit);
          break;

        case 'postImage':
          const { imageUrl, caption } = request.parameters;
          result = await instagramHandler.postImage(imageUrl, caption);
          break;

        case 'postCarousel':
          const { imageUrls, carouselCaption } = request.parameters;
          result = await instagramHandler.postCarousel(imageUrls, carouselCaption);
          break;

        case 'getAccountInfo':
          result = await instagramHandler.getAccountInfo();
          break;

        case 'connect':
          const { appId, appSecret } = request.parameters;
          result = await instagramHandler.connect({ appId, appSecret });
          break;

        case 'disconnect':
          await instagramHandler.disconnect({
            id: 'instagram-connection',
            platformId: 'instagram',
            credentials: {},
            settings: {},
            isActive: true
          });
          result = { success: true };
          break;

        case 'test':
          result = await instagramHandler.test({
            id: 'instagram-connection',
            platformId: 'instagram',
            credentials: {},
            settings: {},
            isActive: true
          });
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
        executionLog: `Successfully executed Instagram action: ${request.action}`
      };
    } catch (error) {
      console.error(`[InstagramMcpServer] Error executing request:`, error);
      
      // Update history with error
      executionRecord.status = 'error';
      executionRecord.error = error.message;

      return {
        success: false,
        error: error.message,
        executionLog: `Error executing Instagram action: ${error.message}`
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
    return platformId === 'instagram';
  }

  getServerType(): string {
    return McpServerType.INSTAGRAM;
  }
}

// Export a singleton instance
export const instagramMcpServer = InstagramMcpServer.getInstance();
