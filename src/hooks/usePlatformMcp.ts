import { useState, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { usePlatforms } from './usePlatforms';
import { IMcpRequest, IMcpResponse, McpServerType } from '@/lib/mcp/IMcpServer';
import { mcpService } from '@/lib/mcp/McpService';
import { useToast } from './use-toast';
import { Platform } from '@/types/platform';

// Import the MCP server instances
import { githubMcpServer } from '@/lib/github/githubMcpServer';
import { githubPagesMcpServer } from '@/lib/github/githubPagesMcpServer';
import { instagramMcpServer } from '@/lib/instagram/instagramMcpServer';
import { facebookMcpServer } from '@/lib/facebook/facebookMcpServer';
import { twitterMcpServer } from '@/lib/twitter/twitterMcpServer';

export function usePlatformMcp() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const { connectedPlatforms } = usePlatforms();
  const { toast } = useToast();

  // Generic MCP server request executor
  const executeRequest = useCallback(async (
    serverType: McpServerType, 
    request: Omit<IMcpRequest, 'userId'>
  ): Promise<IMcpResponse> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsLoading(true);
    
    try {
      const server = mcpService.getServer(serverType);
      if (!server) {
        throw new Error(`Server type ${serverType} not found`);
      }

      const fullRequest: IMcpRequest = {
        ...request,
        userId: user.id
      };

      const response = await server.executeRequest(fullRequest, connectedPlatforms);
      
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
        error: errorMessage,
        executionLog: `Error: ${errorMessage}`
      };
    } finally {
      setIsLoading(false);
    }
  }, [user, connectedPlatforms, toast]);

  // GitHub specific actions
  const executeGitHubAction = useCallback(async (
    action: string, 
    parameters: Record<string, any> = {}
  ): Promise<IMcpResponse> => {
    return await executeRequest(McpServerType.GITHUB, {
      platform: 'github',
      action,
      parameters
    });
  }, [executeRequest]);

  const getGitHubHistory = useCallback(async (limit?: number): Promise<any[]> => {
    if (!user) return [];
    try {
      return await githubMcpServer.getExecutionHistory(user.id, limit, 'github');
    } catch (error) {
      console.error('Failed to load GitHub execution history:', error);
      return [];
    }
  }, [user]);

  // GitHub Pages specific actions
  const executeGitHubPagesAction = useCallback(async (
    action: string, 
    parameters: Record<string, any> = {}
  ): Promise<IMcpResponse> => {
    return await executeRequest(McpServerType.GITHUB_PAGES, {
      platform: 'github_pages',
      action,
      parameters
    });
  }, [executeRequest]);

  const getGitHubPagesHistory = useCallback(async (limit?: number): Promise<any[]> => {
    if (!user) return [];
    try {
      return await githubPagesMcpServer.getExecutionHistory(user.id, limit, 'github_pages');
    } catch (error) {
      console.error('Failed to load GitHub Pages execution history:', error);
      return [];
    }
  }, [user]);

  // Instagram specific actions
  const executeInstagramAction = useCallback(async (
    action: string, 
    parameters: Record<string, any> = {}
  ): Promise<IMcpResponse> => {
    return await executeRequest(McpServerType.INSTAGRAM, {
      platform: 'instagram',
      action,
      parameters
    });
  }, [executeRequest]);

  const getInstagramHistory = useCallback(async (limit?: number): Promise<any[]> => {
    if (!user) return [];
    try {
      return await instagramMcpServer.getExecutionHistory(user.id, limit, 'instagram');
    } catch (error) {
      console.error('Failed to load Instagram execution history:', error);
      return [];
    }
  }, [user]);

  // Facebook specific actions
  const executeFacebookAction = useCallback(async (
    action: string, 
    parameters: Record<string, any> = {}
  ): Promise<IMcpResponse> => {
    return await executeRequest(McpServerType.FACEBOOK, {
      platform: 'facebook',
      action,
      parameters
    });
  }, [executeRequest]);

  const getFacebookHistory = useCallback(async (limit?: number): Promise<any[]> => {
    if (!user) return [];
    try {
      return await facebookMcpServer.getExecutionHistory(user.id, limit, 'facebook');
    } catch (error) {
      console.error('Failed to load Facebook execution history:', error);
      return [];
    }
  }, [user]);

  // Twitter specific actions
  const executeTwitterAction = useCallback(async (
    action: string, 
    parameters: Record<string, any> = {}
  ): Promise<IMcpResponse> => {
    return await executeRequest(McpServerType.TWITTER, {
      platform: 'twitter',
      action,
      parameters
    });
  }, [executeRequest]);

  const getTwitterHistory = useCallback(async (limit?: number): Promise<any[]> => {
    if (!user) return [];
    try {
      return await twitterMcpServer.getExecutionHistory(user.id, limit, 'twitter');
    } catch (error) {
      console.error('Failed to load Twitter execution history:', error);
      return [];
    }
  }, [user]);

  // Check if server is available
  const isServerAvailable = useCallback((serverType: McpServerType): boolean => {
    return mcpService.getServer(serverType) !== undefined;
  }, []);

  return {
    isLoading,
    // GitHub
    executeGitHubAction,
    getGitHubHistory,
    isGitHubAvailable: () => isServerAvailable(McpServerType.GITHUB),
    
    // GitHub Pages
    executeGitHubPagesAction,
    getGitHubPagesHistory,
    isGitHubPagesAvailable: () => isServerAvailable(McpServerType.GITHUB_PAGES),
    
    // Instagram
    executeInstagramAction,
    getInstagramHistory,
    isInstagramAvailable: () => isServerAvailable(McpServerType.INSTAGRAM),
    
    // Facebook
    executeFacebookAction,
    getFacebookHistory,
    isFacebookAvailable: () => isServerAvailable(McpServerType.FACEBOOK),
    
    // Twitter
    executeTwitterAction,
    getTwitterHistory,
    isTwitterAvailable: () => isServerAvailable(McpServerType.TWITTER),
    
    // Generic
    executeRequest
  };
}
