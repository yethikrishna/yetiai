import { Platform } from "@/types/platform";

/**
 * Generic interface for a request to an MCP server
 */
export interface IMcpRequest {
  action: string;
  platform: string;
  parameters: Record<string, any>;
  userId: string;
}

/**
 * Interface representing a response from an MCP server
 */
export interface IMcpResponse {
  success: boolean;
  data?: any;
  error?: string;
  executionLog?: string;
  generatedCode?: string;
}

/**
 * Interface defining the core functionality for an MCP server
 */
export interface IMcpServer {
  /**
   * Executes a request on the MCP server
   * @param request The request to execute
   * @param connectedPlatforms List of connected platforms for context
   */
  executeRequest(request: IMcpRequest, connectedPlatforms: Platform[]): Promise<IMcpResponse>;
  
  /**
   * Retrieves execution history for a specific user
   * @param userId The ID of the user
   * @param limit Optional limit for the number of executions to retrieve
   * @param platform Optional platform filter
   */
  getExecutionHistory(userId: string, limit?: number, platform?: string): Promise<any[]>;
  
  /**
   * Checks if a platform is supported by this MCP server
   * @param platformId The ID of the platform to check
   */
  supportsPlatform(platformId: string): boolean;
  
  /**
   * Gets the type of the MCP server
   */
  getServerType(): string;
}

/**
 * Enum defining the types of MCP servers available
 */
export enum McpServerType {
  DYNAMIC = "dynamic",
  PIPEDREAM = "pipedream",
  CUSTOM = "custom"
}

export type { IMcpServer, IMcpRequest, IMcpResponse };