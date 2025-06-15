
import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { usePlatforms } from './usePlatforms';
import { dynamicMcpServer, McpRequest, McpResponse } from '@/lib/mcp/dynamicMcpServer';
import { useToast } from './use-toast';

export function useMcpServer() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionHistory, setExecutionHistory] = useState<any[]>([]);
  const { user } = useUser();
  const { connectedPlatforms } = usePlatforms();
  const { toast } = useToast();

  const executeRequest = async (request: Omit<McpRequest, 'userId'>): Promise<McpResponse> => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsExecuting(true);
    
    try {
      const fullRequest: McpRequest = {
        ...request,
        userId: user.id
      };

      const response = await dynamicMcpServer.executeRequest(fullRequest, connectedPlatforms);
      
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
      setIsExecuting(false);
    }
  };

  const loadExecutionHistory = async (platformId?: string) => {
    if (!user) return;

    try {
      const history = await dynamicMcpServer.getExecutionHistory(user.id, platformId);
      setExecutionHistory(history);
    } catch (error) {
      console.error('Failed to load execution history:', error);
    }
  };

  const executePlatformAction = async (
    platformId: string, 
    action: string, 
    parameters: Record<string, any>
  ) => {
    return await executeRequest({
      platform: platformId,
      action,
      parameters
    });
  };

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

  return {
    executeRequest,
    executePlatformAction,
    loadExecutionHistory,
    executionHistory,
    isExecuting,
    githubActions,
    gmailActions,
    slackActions
  };
}
