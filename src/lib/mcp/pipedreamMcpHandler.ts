
import { pipedreamService, PipedreamAccount } from '@/lib/pipedream/pipedreamService';
import { ConnectionService } from '@/lib/supabase/connectionService';

export interface PipedreamMcpRequest {
  action: string;
  accountId?: string;
  app?: string;
  parameters: Record<string, any>;
  userId: string;
}

export class PipedreamMcpHandler {
  static async executeRequest(request: PipedreamMcpRequest): Promise<any> {
    const { action, accountId, app, parameters, userId } = request;
    
    console.log('Executing Pipedream MCP request:', request);
    
    try {
      switch (action) {
        case 'list_accounts':
          return await this.listAccounts(userId);
          
        case 'get_account_info':
          if (!accountId) throw new Error('Account ID is required');
          return await this.getAccountInfo(accountId);
          
        case 'execute_action':
          if (!accountId) throw new Error('Account ID is required');
          return await this.executeAction(accountId, parameters);
          
        case 'send_data':
          if (!accountId) throw new Error('Account ID is required');
          return await this.sendData(accountId, parameters);
          
        case 'create_workflow':
          return await this.createWorkflow(userId, parameters);
          
        case 'trigger_webhook':
          return await this.triggerWebhook(parameters);
          
        case 'search_data':
          if (!accountId) throw new Error('Account ID is required');
          return await this.searchData(accountId, parameters);
          
        case 'get_apps':
          return await this.getAvailableApps();
          
        default:
          throw new Error(`Unknown Pipedream action: ${action}`);
      }
    } catch (error) {
      console.error('Pipedream MCP execution error:', error);
      throw error;
    }
  }

  private static async listAccounts(userId: string): Promise<PipedreamAccount[]> {
    try {
      const accounts = await pipedreamService.getAccounts(userId);
      return accounts;
    } catch (error) {
      console.error('Failed to list Pipedream accounts:', error);
      throw new Error('Failed to retrieve connected accounts');
    }
  }

  private static async getAccountInfo(accountId: string): Promise<any> {
    try {
      // Get account details from Pipedream
      const response = await fetch(`https://api.pipedream.com/v1/accounts/${accountId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.PIPEDREAM_CLIENT_SECRET}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get account info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get account info:', error);
      throw error;
    }
  }

  private static async executeAction(accountId: string, parameters: any): Promise<any> {
    try {
      const { actionName, inputs } = parameters;
      
      if (!actionName) {
        throw new Error('Action name is required');
      }

      return await pipedreamService.executeAction(accountId, actionName, inputs || {});
    } catch (error) {
      console.error('Failed to execute Pipedream action:', error);
      throw error;
    }
  }

  private static async sendData(accountId: string, parameters: any): Promise<any> {
    try {
      const { app, data, endpoint } = parameters;
      
      // Generic data sending to connected app
      return await pipedreamService.executeAction(accountId, 'send_data', {
        app,
        data,
        endpoint
      });
    } catch (error) {
      console.error('Failed to send data via Pipedream:', error);
      throw error;
    }
  }

  private static async createWorkflow(userId: string, parameters: any): Promise<any> {
    try {
      const { name, trigger, steps } = parameters;
      
      const workflowConfig = {
        name,
        trigger,
        steps: steps || []
      };

      return await pipedreamService.createWorkflow(userId, workflowConfig);
    } catch (error) {
      console.error('Failed to create Pipedream workflow:', error);
      throw error;
    }
  }

  private static async triggerWebhook(parameters: any): Promise<any> {
    try {
      const { webhookUrl, data } = parameters;
      
      if (!webhookUrl) {
        throw new Error('Webhook URL is required');
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data || {})
      });

      return {
        success: response.ok,
        status: response.status,
        statusText: response.statusText
      };
    } catch (error) {
      console.error('Failed to trigger webhook:', error);
      throw error;
    }
  }

  private static async searchData(accountId: string, parameters: any): Promise<any> {
    try {
      const { app, query, filters } = parameters;
      
      return await pipedreamService.executeAction(accountId, 'search', {
        app,
        query,
        filters: filters || {}
      });
    } catch (error) {
      console.error('Failed to search data via Pipedream:', error);
      throw error;
    }
  }

  private static async getAvailableApps(): Promise<any> {
    try {
      return await pipedreamService.getAvailableApps();
    } catch (error) {
      console.error('Failed to get available apps:', error);
      throw error;
    }
  }
}
