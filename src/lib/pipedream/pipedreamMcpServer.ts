import { Platform } from "@/types/platform";
import { PipedreamApp } from "@/types/pipedream";
import { 
  fetchPipedreamApps, 
  searchPipedreamApps, 
  connectToPipedreamApp, 
  disconnectFromPipedreamApp,
  testPipedreamConnection,
  executePipedreamAction 
} from "./pipedreamService";
import { IMcpServer, IMcpRequest, IMcpResponse, McpServerType } from "@/lib/mcp/IMcpServer";

export interface PipedreamMcpRequest {
  action: 'connect' | 'disconnect' | 'execute' | 'test' | 'list' | 'search';
  appSlug?: string;
  credentials?: Record<string, string>;
  parameters?: Record<string, any>;
  query?: string;
  category?: string;
}

export interface PipedreamMcpResponse {
  success: boolean;
  data?: any;
  error?: string;
  apps?: PipedreamApp[];
  message?: string;
}

export class PipedreamMcpServer implements IMcpServer {
  private static instance: PipedreamMcpServer;
  private connectedApps: Set<string> = new Set();
  private executionHistory: Record<string, any[]> = {};

  static getInstance(): PipedreamMcpServer {
    if (!PipedreamMcpServer.instance) {
      PipedreamMcpServer.instance = new PipedreamMcpServer();
    }
    return PipedreamMcpServer.instance;
  }

  async executeRequest(request: IMcpRequest, connectedPlatforms: Platform[]): Promise<IMcpResponse> {
    try {
      console.log('Pipedream MCP Request:', request);

      // Map IMcpRequest to PipedreamMcpRequest
      const pipedreamRequest: PipedreamMcpRequest = {
        action: request.action as any,
        appSlug: request.platform,
        parameters: request.parameters
      };

      // Handle the request using existing methods
      const response = await this.handleRequest(pipedreamRequest);

      // Store execution in history
      this.storeExecution(request.userId, {
        timestamp: new Date(),
        request,
        response,
        platform: request.platform
      });

      // Map PipedreamMcpResponse to IMcpResponse
      return {
        success: response.success,
        data: response.data || response.apps,
        error: response.error,
        executionLog: response.message
      };
    } catch (error) {
      console.error('Pipedream MCP Error in executeRequest:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionLog: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async getExecutionHistory(userId: string, limit?: number, platform?: string): Promise<any[]> {
    const history = this.executionHistory[userId] || [];
    
    let filteredHistory = platform 
      ? history.filter(item => item.platform === platform)
      : history;
    
    if (limit && limit > 0) {
      filteredHistory = filteredHistory.slice(0, limit);
    }
    
    return filteredHistory;
  }
  
  supportsPlatform(platformId: string): boolean {
    // Logic to determine if a platform is supported by Pipedream
    // For now, consider all platforms with pipedream integration as supported
    return true; // This should be refined based on actual pipedream capabilities
  }
  
  getServerType(): string {
    return McpServerType.PIPEDREAM;
  }

  private storeExecution(userId: string, execution: any): void {
    if (!this.executionHistory[userId]) {
      this.executionHistory[userId] = [];
    }
    this.executionHistory[userId].unshift(execution); // Add to beginning of array
    
    // Limit history size
    const MAX_HISTORY = 100;
    if (this.executionHistory[userId].length > MAX_HISTORY) {
      this.executionHistory[userId] = this.executionHistory[userId].slice(0, MAX_HISTORY);
    }
  }

  async handleRequest(request: PipedreamMcpRequest): Promise<PipedreamMcpResponse> {
    try {
      console.log('Pipedream MCP Request:', request);

      switch (request.action) {
        case 'list':
          return await this.handleListApps(request);
        
        case 'search':
          return await this.handleSearchApps(request);
        
        case 'connect':
          return await this.handleConnectApp(request);
        
        case 'disconnect':
          return await this.handleDisconnectApp(request);
        
        case 'test':
          return await this.handleTestConnection(request);
        
        case 'execute':
          return await this.handleExecuteAction(request);
        
        default:
          return {
            success: false,
            error: `Unknown action: ${request.action}`
          };
      }
    } catch (error) {
      console.error('Pipedream MCP Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private async handleListApps(request: PipedreamMcpRequest): Promise<PipedreamMcpResponse> {
    try {
      const apps = await fetchPipedreamApps();
      
      // Filter by category if specified
      const filteredApps = request.category 
        ? apps.filter(app => app.categories.includes(request.category!))
        : apps;

      return {
        success: true,
        apps: filteredApps,
        message: `Found ${filteredApps.length} apps`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to fetch apps: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleSearchApps(request: PipedreamMcpRequest): Promise<PipedreamMcpResponse> {
    try {
      if (!request.query) {
        return {
          success: false,
          error: 'Search query is required'
        };
      }

      const apps = await searchPipedreamApps(request.query);
      
      return {
        success: true,
        apps,
        message: `Found ${apps.length} apps matching "${request.query}"`
      };
    } catch (error) {
      return {
        success: false,
        error: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleConnectApp(request: PipedreamMcpRequest): Promise<PipedreamMcpResponse> {
    try {
      if (!request.appSlug) {
        return {
          success: false,
          error: 'App slug is required for connection'
        };
      }

      if (!request.credentials) {
        return {
          success: false,
          error: 'Credentials are required for connection'
        };
      }

      const success = await connectToPipedreamApp(request.appSlug, request.credentials);
      
      if (success) {
        this.connectedApps.add(request.appSlug);
        return {
          success: true,
          message: `Successfully connected to ${request.appSlug}`,
          data: {
            appSlug: request.appSlug,
            connectedAt: new Date().toISOString()
          }
        };
      } else {
        return {
          success: false,
          error: `Failed to connect to ${request.appSlug}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleDisconnectApp(request: PipedreamMcpRequest): Promise<PipedreamMcpResponse> {
    try {
      if (!request.appSlug) {
        return {
          success: false,
          error: 'App slug is required for disconnection'
        };
      }

      const success = await disconnectFromPipedreamApp(request.appSlug);
      
      if (success) {
        this.connectedApps.delete(request.appSlug);
        return {
          success: true,
          message: `Successfully disconnected from ${request.appSlug}`,
          data: {
            appSlug: request.appSlug,
            disconnectedAt: new Date().toISOString()
          }
        };
      } else {
        return {
          success: false,
          error: `Failed to disconnect from ${request.appSlug}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Disconnection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleTestConnection(request: PipedreamMcpRequest): Promise<PipedreamMcpResponse> {
    try {
      if (!request.appSlug) {
        return {
          success: false,
          error: 'App slug is required for connection test'
        };
      }

      if (!this.connectedApps.has(request.appSlug)) {
        return {
          success: false,
          error: `${request.appSlug} is not connected`
        };
      }

      const testResult = await testPipedreamConnection(request.appSlug);
      
      return {
        success: testResult,
        message: testResult 
          ? `Connection to ${request.appSlug} is working properly`
          : `Connection to ${request.appSlug} is not working`,
        data: {
          appSlug: request.appSlug,
          testedAt: new Date().toISOString(),
          status: testResult ? 'healthy' : 'unhealthy'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleExecuteAction(request: PipedreamMcpRequest): Promise<PipedreamMcpResponse> {
    try {
      if (!request.appSlug) {
        return {
          success: false,
          error: 'App slug is required for action execution'
        };
      }

      if (!request.parameters?.action) {
        return {
          success: false,
          error: 'Action name is required in parameters'
        };
      }

      if (!this.connectedApps.has(request.appSlug)) {
        return {
          success: false,
          error: `${request.appSlug} is not connected. Please connect first.`
        };
      }

      const result = await executePipedreamAction(
        request.appSlug,
        request.parameters.action,
        request.parameters
      );

      return {
        success: true,
        data: result,
        message: `Successfully executed ${request.parameters.action} on ${request.appSlug}`
      };
    } catch (error) {
      return {
        success: false,
        error: `Action execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Utility methods
  getConnectedApps(): string[] {
    return Array.from(this.connectedApps);
  }

  isAppConnected(appSlug: string): boolean {
    return this.connectedApps.has(appSlug);
  }

  getConnectionCount(): number {
    return this.connectedApps.size;
  }
}

export const pipedreamMcpServer = PipedreamMcpServer.getInstance();