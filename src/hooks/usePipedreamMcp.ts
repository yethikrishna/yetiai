
import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useToast } from './use-toast';
import { dynamicMcpServer } from '@/lib/mcp/dynamicMcpServer';
import { pipedreamService } from '@/lib/pipedream/pipedreamService';

export function usePipedreamMcp() {
  const [isExecuting, setIsExecuting] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const { user } = useUser();
  const { toast } = useToast();

  const executeAction = async (action: string, parameters: Record<string, any> = {}) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsExecuting(true);
    
    try {
      const response = await dynamicMcpServer.executeRequest({
        platform: 'pipedream',
        action,
        parameters,
        userId: user.id
      }, []);

      if (response.success) {
        toast({
          title: "Action Executed",
          description: `Successfully executed ${action} on Pipedream`,
        });
        return response.data;
      } else {
        throw new Error(response.error || 'Unknown error occurred');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Execution Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsExecuting(false);
    }
  };

  const loadAccounts = async () => {
    if (!user) return;

    try {
      const accountData = await executeAction('list_accounts');
      setAccounts(accountData || []);
      return accountData;
    } catch (error) {
      console.error('Failed to load Pipedream accounts:', error);
      setAccounts([]);
    }
  };

  const sendData = async (accountId: string, app: string, data: any, endpoint?: string) => {
    return await executeAction('send_data', {
      accountId,
      app,
      data,
      endpoint
    });
  };

  const searchData = async (accountId: string, app: string, query: string, filters?: any) => {
    return await executeAction('search_data', {
      accountId,
      app,
      query,
      filters
    });
  };

  const triggerWebhook = async (webhookUrl: string, data: any) => {
    return await executeAction('trigger_webhook', {
      webhookUrl,
      data
    });
  };

  const createWorkflow = async (name: string, trigger: any, steps: any[]) => {
    return await executeAction('create_workflow', {
      name,
      trigger,
      steps
    });
  };

  const getAvailableApps = async () => {
    return await executeAction('get_apps');
  };

  const executePipedreamAction = async (accountId: string, actionName: string, inputs: any) => {
    return await executeAction('execute_action', {
      accountId,
      actionName,
      inputs
    });
  };

  return {
    isExecuting,
    accounts,
    loadAccounts,
    sendData,
    searchData,
    triggerWebhook,
    createWorkflow,
    getAvailableApps,
    executePipedreamAction,
    executeAction
  };
}
