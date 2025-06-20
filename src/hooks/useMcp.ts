import { useState, useCallback, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { usePlatforms } from './usePlatforms';
import { IMcpRequest, IMcpResponse, McpServerType, IMcpServer } from '@/lib/mcp/IMcpServer';
import { mcpService } from '@/lib/mcp/McpService';
import { useToast } from './use-toast';
import { Platform } from '@/types/platform';
import { PipedreamApp } from '@/types/pipedream';

interface PipedreamServerExtensions {
  isAppConnected?: (appSlug: string) => boolean;
  getConnectionCount?: () => number;
}

type PipedreamServerType = IMcpServer & PipedreamServerExtensions;

export function useMcp() {
  const [isLoading, setIsLoading] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<Record<string, any>[]>([]);
  const [connectedApps, setConnectedApps] = useState<string[]>([]);
  const { user } = useUser();
  const { connectedPlatforms } = usePlatforms();
  const { toast } = useToast();

  /**
   * Execute a request using the appropriate MCP server for the platform
   */
  const executeRequest = useCallback(async (request: Omit<IMcpRequest, 'userId'>): Promise<IMcpResponse> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsLoading(true);
    
    try {
      const fullRequest: IMcpRequest = {
        ...request,
        userId: user.id
      };

      const response = await mcpService.executeRequest(fullRequest, connectedPlatforms);
      
      if (response.success) {
        toast({
          title: "Action Executed",
          description: `Successfully executed ${request.action} on ${request.platform}`,
        });
      } else {
        toast({
          title: "Execution Failed",
          description: response.error || "Unknown error occurred",
          variant: "destructive",
        });
      }

      // Refresh execution history
      await loadExecutionHistory();
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Request Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, [user, connectedPlatforms, toast]);

  /**
   * Load execution history for the current user
   */
  const loadExecutionHistory = useCallback(async (platformId?: string, limit?: number) => {
    if (!user) return;

    try {
      const history = await mcpService.getExecutionHistory(user.id, limit, platformId);
      setExecutionHistory(history);
      return history;
    } catch (error) {
      console.error('Failed to load execution history:', error);
      return [];
    }
  }, [user]);

  /**
   * Execute an action for a specific platform
   */
  const executePlatformAction = useCallback(async (
    platformId: string, 
    action: string, 
    parameters: Record<string, any> = {}
  ): Promise<IMcpResponse> => {
    return await executeRequest({
      platform: platformId,
      action,
      parameters
    });
  }, [executeRequest]);

  // Pipedream-specific functions
  const listPipedreamApps = useCallback(async (category?: string): Promise<PipedreamApp[]> => {
    const response = await executeRequest({
      platform: 'pipedream',
      action: 'list',
      parameters: { category }
    });
    return response.data?.apps || [];
  }, [executeRequest]);

  const searchPipedreamApps = useCallback(async (query: string): Promise<PipedreamApp[]> => {
    const response = await executeRequest({
      platform: 'pipedream',
      action: 'search',
      parameters: { query }
    });
    return response.data?.apps || [];
  }, [executeRequest]);

  const connectPipedreamApp = useCallback(async (appSlug: string, credentials: Record<string, string>): Promise<boolean> => {
    const response = await executeRequest({
      platform: 'pipedream',
      action: 'connect',
      parameters: { appSlug, credentials }
    });
    
    if (response.success) {
      // Update connected apps list
      const pipedreamServer = mcpService.getServer(McpServerType.PIPEDREAM) as PipedreamServerType;
      if (pipedreamServer) {
        const updatedConnections = await pipedreamServer.getExecutionHistory(user?.id || '', 0);
        setConnectedApps(updatedConnections);
      }
    }
    
    return response.success;
  }, [executeRequest, user]);

  const disconnectPipedreamApp = useCallback(async (appSlug: string): Promise<boolean> => {
    const response = await executeRequest({
      platform: 'pipedream',
      action: 'disconnect',
      parameters: { appSlug }
    });
    
    if (response.success) {
      // Update connected apps list
      const pipedreamServer = mcpService.getServer(McpServerType.PIPEDREAM) as PipedreamServerType;
      if (pipedreamServer) {
        const updatedConnections = await pipedreamServer.getExecutionHistory(user?.id || '', 0);
        setConnectedApps(updatedConnections);
      }
    }
    
    return response.success;
  }, [executeRequest, user]);

  const testPipedreamConnection = useCallback(async (appSlug: string): Promise<boolean> => {
    const response = await executeRequest({
      platform: 'pipedream',
      action: 'test',
      parameters: { appSlug }
    });
    return response.success;
  }, [executeRequest]);

  const executePipedreamAction = useCallback(async (
    appSlug: string, 
    action: string, 
    parameters: Record<string, any> = {}
  ): Promise<any> => {
    const response = await executeRequest({
      platform: 'pipedream',
      action: 'execute',
      parameters: { appSlug, action, ...parameters }
    });
    return response.success ? response.data : null;
  }, [executeRequest]);

  const isPipedreamAppConnected = useCallback((appSlug: string): boolean => {
    const pipedreamServer = mcpService.getServer(McpServerType.PIPEDREAM) as PipedreamServerType;
    if (!pipedreamServer) return false;
    
    // Use the server's specific API if available
    if (pipedreamServer.isAppConnected) {
      return pipedreamServer.isAppConnected(appSlug);
    }
    
    // Fallback to checking connected apps list
    return connectedApps.includes(appSlug);
  }, [connectedApps]);

  const getPipedreamConnectionCount = useCallback((): number => {
    const pipedreamServer = mcpService.getServer(McpServerType.PIPEDREAM) as PipedreamServerType;
    if (!pipedreamServer) return 0;
    
    // Use the server's specific API if available
    if (pipedreamServer.getConnectionCount) {
      return pipedreamServer.getConnectionCount();
    }
    
    // Fallback to connected apps list length
    return connectedApps.length;
  }, [connectedApps]);

  // Common platform actions
  const githubActions = {
    createRepository: (name: string, description?: string, isPrivate?: boolean) =>
      executePlatformAction('github', 'create_repository', { name, description, private: isPrivate }),
    
    getRepositories: (username?: string) =>
      executePlatformAction('github', 'get_repositories', { username }),
    
    createIssue: (owner: string, repo: string, title: string, body?: string) =>
      executePlatformAction('github', 'create_issue', { owner, repo, title, body }),
    
    searchRepositories: (query: string) =>
      executePlatformAction('github', 'search_repositories', { query })
  };

  const gmailActions = {
    sendEmail: (to: string, subject: string, body: string) =>
      executePlatformAction('gmail', 'send_email', { to, subject, body }),
    
    getEmails: (maxResults?: number) =>
      executePlatformAction('gmail', 'get_emails', { maxResults }),
    
    searchEmails: (query: string) =>
      executePlatformAction('gmail', 'search_emails', { query })
  };

  const slackActions = {
    sendMessage: (channel: string, text: string) =>
      executePlatformAction('slack', 'send_message', { channel, text }),
    
    getChannels: () =>
      executePlatformAction('slack', 'get_channels', {}),
    
    getUserInfo: () =>
      executePlatformAction('slack', 'get_user_info', {})
  };

  // Initialize by loading execution history
  useEffect(() => {
    if (user) {
      loadExecutionHistory();
    }
  }, [user, loadExecutionHistory]);

  return {
    isLoading,
    executeRequest,
    executePlatformAction,
    loadExecutionHistory,
    executionHistory,
    
    // Pipedream specific
    listPipedreamApps,
    searchPipedreamApps,
    connectPipedreamApp,
    disconnectPipedreamApp,
    testPipedreamConnection,
    executePipedreamAction,
    isPipedreamAppConnected,
    getPipedreamConnectionCount,
    
    // Platform-specific action bundles
    githubActions,
    gmailActions,
    slackActions
  };
}
