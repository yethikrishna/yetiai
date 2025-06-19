import { IMcpServer, IMcpRequest, IMcpResponse, McpServerType } from '../mcp/IMcpServer';
import { Platform } from '@/types/platform';
import { twitterHandler } from '@/handlers/twitter';
import { twitterApiClient } from '@/handlers/twitter/apiClient';
import { twitterOAuthHandler } from '@/handlers/twitter/oauthHandler';
import { TwitterApiResponse } from '@/types/twitter';

class TwitterMcpServer implements IMcpServer {
  private static instance: TwitterMcpServer;
  private executionHistory: Record<string, any[]> = {};

  private constructor() {}

  public static getInstance(): TwitterMcpServer {
    if (!TwitterMcpServer.instance) {
      TwitterMcpServer.instance = new TwitterMcpServer();
    }
    return TwitterMcpServer.instance;
  }

  async executeRequest(request: IMcpRequest, connectedPlatforms: Platform[]): Promise<IMcpResponse> {
    console.log(`[TwitterMcpServer] Executing request: ${request.action}`);

    // Store execution for history
    if (!this.executionHistory[request.userId]) {
      this.executionHistory[request.userId] = [];
    }

    const executionRecord = {
      timestamp: new Date(),
      action: request.action,
      platform: request.platform,
      parameters: request.parameters,
      status: 'pending'
    };

    this.executionHistory[request.userId].unshift(executionRecord);

    try {
      // Validate that we're dealing with a Twitter request
      if (!this.supportsPlatform(request.platform)) {
        throw new Error(`Platform ${request.platform} not supported by Twitter MCP server`);
      }

      // Check if Twitter is connected/authenticated, except for connect action
      const tokens = twitterOAuthHandler.getStoredTokens();
      if (!tokens && request.action !== 'connect') {
        throw new Error('Twitter not connected. Please connect your Twitter account first.');
      }

      let result;
      
      // Handle different Twitter actions
      switch (request.action) {
        case 'connect':
          const { clientId, clientSecret } = request.parameters;
          result = await twitterHandler.connect({ clientId, clientSecret });
          break;

        case 'disconnect':
          await twitterHandler.disconnect(connectedPlatforms.find(p => p.id === 'twitter') as Platform);
          result = { success: true };
          break;

        case 'test':
          result = await twitterHandler.test(connectedPlatforms.find(p => p.id === 'twitter') as Platform);
          break;

        case 'postTweet':
          const { text, mediaIds } = request.parameters;
          result = await twitterHandler.postTweet(text, mediaIds);
          break;

        case 'getUserTweets':
          const { userId, maxResults = 10 } = request.parameters;
          result = await twitterHandler.getUserTweets(userId, maxResults);
          break;

        case 'searchTweets':
          const { query, searchMaxResults = 10 } = request.parameters;
          result = await twitterHandler.searchTweets(query, searchMaxResults);
          break;

        case 'followUser':
          const { targetUserId } = request.parameters;
          result = await twitterHandler.followUser(targetUserId);
          break;

        case 'unfollowUser':
          const { unfollowUserId } = request.parameters;
          result = await twitterHandler.unfollowUser(unfollowUserId);
          break;

        case 'getUserByUsername':
          const { username } = request.parameters;
          result = await twitterHandler.getUserByUsername(username);
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
        executionLog: `Successfully executed Twitter action: ${request.action}`
      };
    } catch (error) {
      console.error(`[TwitterMcpServer] Error executing request:`, error);
      
      // Update history with error
      executionRecord.status = 'error';
      executionRecord.error = error.message;

      return {
        success: false,
        error: error.message,
        executionLog: `Error executing Twitter action: ${error.message}`
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
    return platformId === 'twitter';
  }

  getServerType(): string {
    return McpServerType.TWITTER;
  }
}

// Export a singleton instance
export const twitterMcpServer = TwitterMcpServer.getInstance();
