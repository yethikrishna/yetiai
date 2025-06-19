
import { useState, useCallback } from 'react';
import { pipedreamMcpServer, PipedreamMcpRequest, PipedreamMcpResponse } from '@/lib/pipedream/pipedreamMcpServer';
import { PipedreamApp } from '@/types/pipedream';
import { useToast } from '@/hooks/use-toast';

export function usePipedreamMcp() {
  const [isLoading, setIsLoading] = useState(false);
  const [connectedApps, setConnectedApps] = useState<string[]>([]);
  const { toast } = useToast();

  const executeRequest = useCallback(async (request: PipedreamMcpRequest): Promise<PipedreamMcpResponse> => {
    setIsLoading(true);
    try {
      const response = await pipedreamMcpServer.handleRequest(request);
      
      if (response.success) {
        // Update connected apps list if the action affects connections
        if (request.action === 'connect' || request.action === 'disconnect') {
          const updatedConnections = pipedreamMcpServer.getConnectedApps();
          setConnectedApps(updatedConnections);
        }
        
        // Show success toast for user actions
        if (['connect', 'disconnect', 'execute'].includes(request.action) && response.message) {
          toast({
            title: "Success",
            description: response.message,
          });
        }
      } else {
        // Show error toast
        toast({
          title: "Error",
          description: response.error || "Operation failed",
          variant: "destructive",
        });
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "Error",
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
  }, [toast]);

  const listApps = useCallback(async (category?: string): Promise<PipedreamApp[]> => {
    const response = await executeRequest({
      action: 'list',
      category
    });
    return response.apps || [];
  }, [executeRequest]);

  const searchApps = useCallback(async (query: string): Promise<PipedreamApp[]> => {
    const response = await executeRequest({
      action: 'search',
      query
    });
    return response.apps || [];
  }, [executeRequest]);

  const connectApp = useCallback(async (appSlug: string, credentials: Record<string, string>): Promise<boolean> => {
    const response = await executeRequest({
      action: 'connect',
      appSlug,
      credentials
    });
    return response.success;
  }, [executeRequest]);

  const disconnectApp = useCallback(async (appSlug: string): Promise<boolean> => {
    const response = await executeRequest({
      action: 'disconnect',
      appSlug
    });
    return response.success;
  }, [executeRequest]);

  const testConnection = useCallback(async (appSlug: string): Promise<boolean> => {
    const response = await executeRequest({
      action: 'test',
      appSlug
    });
    return response.success;
  }, [executeRequest]);

  const executeAction = useCallback(async (
    appSlug: string, 
    action: string, 
    parameters: Record<string, any>
  ): Promise<any> => {
    const response = await executeRequest({
      action: 'execute',
      appSlug,
      parameters: { action, ...parameters }
    });
    return response.success ? response.data : null;
  }, [executeRequest]);

  const isAppConnected = useCallback((appSlug: string): boolean => {
    return pipedreamMcpServer.isAppConnected(appSlug);
  }, []);

  const getConnectionCount = useCallback((): number => {
    return pipedreamMcpServer.getConnectionCount();
  }, []);

  return {
    isLoading,
    connectedApps,
    executeRequest,
    listApps,
    searchApps,
    connectApp,
    disconnectApp,
    testConnection,
    executeAction,
    isAppConnected,
    getConnectionCount
  };
}
