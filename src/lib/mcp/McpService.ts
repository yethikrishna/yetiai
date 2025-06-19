import { Platform } from "@/types/platform";
import { IMcpRequest, IMcpResponse, IMcpServer, McpServerType } from "./IMcpServer";
import { DynamicMcpServer } from "./dynamicMcpServer";
import { PipedreamMcpServer } from "@/lib/pipedream/pipedreamMcpServer";
import { ConnectionService } from "@/lib/supabase/connectionService";

/**
 * McpService - Centralized service for managing and interacting with different MCP server implementations
 * Implements the singleton pattern for global access across the application.
 */
export class McpService {
  private static instance: McpService;
  private servers: Map<string, IMcpServer> = new Map();
  
  private constructor() {
    // Register default servers
    this.registerServer(McpServerType.DYNAMIC, DynamicMcpServer.getInstance());
    this.registerServer(McpServerType.PIPEDREAM, PipedreamMcpServer.getInstance());
  }

  /**
   * Get the singleton instance of the McpService
   */
  public static getInstance(): McpService {
    if (!McpService.instance) {
      McpService.instance = new McpService();
    }
    return McpService.instance;
  }

  /**
   * Register a new MCP server implementation
   * @param serverType The type identifier for the server
   * @param server The server implementation
   */
  public registerServer(serverType: string, server: IMcpServer): void {
    this.servers.set(serverType, server);
    console.log(`Registered MCP server: ${serverType}`);
  }

  /**
   * Get an MCP server by type
   * @param serverType The type of server to retrieve
   * @returns The requested MCP server or undefined if not found
   */
  public getServer(serverType: string): IMcpServer | undefined {
    return this.servers.get(serverType);
  }

  /**
   * Get the appropriate server for a specific platform
   * @param platformId The platform ID to find a server for
   * @returns The appropriate MCP server for the platform or undefined if none found
   */
  public getServerForPlatform(platformId: string): IMcpServer | undefined {
    for (const [_, server] of this.servers) {
      if (server.supportsPlatform(platformId)) {
        return server;
      }
    }
    return undefined;
  }

  /**
   * Execute a request using the appropriate MCP server for the specified platform
   * @param request The request to execute
   * @param connectedPlatforms List of connected platforms
   * @returns Promise resolving to the MCP response
   */
  public async executeRequest(request: IMcpRequest, connectedPlatforms: Platform[]): Promise<IMcpResponse> {
    try {
      // Find the appropriate server for this platform
      const server = this.getServerForPlatform(request.platform);
      
      if (!server) {
        return {
          success: false,
          error: `No MCP server found that supports platform: ${request.platform}`
        };
      }

      console.log(`Executing request on ${server.getServerType()} server for platform ${request.platform}`);
      return await server.executeRequest(request, connectedPlatforms);
    } catch (error) {
      console.error('Failed to execute MCP request:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred during MCP request execution'
      };
    }
  }

  /**
   * Execute an autonomous action for an AI agent
   * @param platform The platform to execute the action on
   * @param action The action to execute
   * @param userId The user ID for logging
   * @param parameters Additional parameters for the action
   * @param connectedPlatforms List of connected platforms
   */
  public async executeAutonomousAction(
    platform: string,
    action: string,
    userId: string,
    parameters: Record<string, any> = {},
    connectedPlatforms: Platform[]
  ): Promise<IMcpResponse> {
    try {
      console.log(`🤖 Executing autonomous action: ${action} on ${platform} for user ${userId}`);

      // Prepare the request with the autonomous flag
      const request: IMcpRequest = {
        action,
        platform,
        parameters: { ...parameters, autonomous: true },
        userId
      };

      // Execute the request and log it
      const response = await this.executeRequest(request, connectedPlatforms);

      // Log the execution regardless of success or failure
      await ConnectionService.logExecution(
        userId,
        platform,
        action,
        request.parameters,
        response.data,
        response.success ? 'success' : 'error',
        response.error,
        undefined  // Execution time would ideally be tracked and passed here
      );

      return response;
    } catch (error) {
      console.error('Autonomous action execution failed:', error);
      
      // Log the failure
      await ConnectionService.logExecution(
        userId,
        platform,
        action,
        parameters,
        null,
        'error',
        error instanceof Error ? error.message : 'Unknown error'
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Autonomous action execution failed'
      };
    }
  }

  /**
   * Get execution history for a user across all servers or for a specific platform
   * @param userId The user ID to get history for
   * @param limit Optional limit for number of results
   * @param platform Optional platform to filter by
   * @returns Array of execution history items
   */
  public async getExecutionHistory(userId: string, limit?: number, platform?: string): Promise<Array<Record<string, any>>> {
    try {
      // If platform is specified, get history from the specific server
      if (platform) {
        const server = this.getServerForPlatform(platform);
        if (server) {
          return await server.getExecutionHistory(userId, limit, platform);
        }
      }

      // Otherwise, get history from all servers and combine
      const allHistory: Array<Record<string, any>> = [];
      for (const [_, server] of this.servers) {
        const history = await server.getExecutionHistory(userId, limit);
        allHistory.push(...history);
      }

      // Sort combined history by timestamp (assuming each item has a timestamp)
      return allHistory.sort((a, b) => {
        const dateA = new Date(a.created_at || a.timestamp || 0).getTime();
        const dateB = new Date(b.created_at || b.timestamp || 0).getTime();
        return dateB - dateA; // Most recent first
      }).slice(0, limit);
    } catch (error) {
      console.error('Failed to retrieve execution history:', error);
      return [];
    }
  }

  /**
   * List all registered MCP server types
   * @returns Array of server type strings
   */
  public getRegisteredServerTypes(): string[] {
    return Array.from(this.servers.keys());
  }
}

// Export a singleton instance
export const mcpService = McpService.getInstance();