
import { createBackendClient } from "@pipedream/sdk/server";

const PIPEDREAM_CONFIG = {
  clientId: 'cfz9GEESE7FO31sbLJnX4v93DGqwpy1mPlZhSwPNMWg',
  clientSecret: 'X_hpK7GecetqL7Y2qFWtrQQgH1sJBuD6fQwxAQ_N4QM',
  projectId: 'proj_Los2XgZ',
  environment: 'production' as const
};

export interface PipedreamAccount {
  id: string;
  app: string;
  name: string;
  email?: string;
  username?: string;
  external_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface PipedreamApp {
  name: string;
  name_slug: string;
  auth_type: string;
  custom_fields_json: any;
  categories: string[];
}

export class PipedreamService {
  private client: any;

  constructor() {
    this.client = createBackendClient({
      environment: PIPEDREAM_CONFIG.environment,
      credentials: {
        clientId: PIPEDREAM_CONFIG.clientId,
        clientSecret: PIPEDREAM_CONFIG.clientSecret,
      },
      projectId: PIPEDREAM_CONFIG.projectId
    });
  }

  async createConnectToken(externalUserId: string, app?: string) {
    try {
      const tokenData: any = {
        external_user_id: externalUserId
      };

      // Only add app if specified and not empty
      if (app && app.trim() !== '') {
        tokenData.app = app;
      }

      const result = await this.client.createConnectToken(tokenData);
      
      console.log('Created Pipedream connect token:', result);
      return result;
    } catch (error) {
      console.error('Failed to create Pipedream connect token:', error);
      throw error;
    }
  }

  async getAccounts(externalUserId: string): Promise<PipedreamAccount[]> {
    try {
      const accounts = await this.client.getAccounts({
        external_user_id: externalUserId
      });
      
      console.log('Retrieved Pipedream accounts:', accounts);
      return accounts || [];
    } catch (error) {
      console.error('Failed to get Pipedream accounts:', error);
      throw error;
    }
  }

  async getAvailableApps(): Promise<PipedreamApp[]> {
    try {
      // This would typically come from Pipedream's API
      // For now, we'll return a comprehensive list
      const apps = await this.client.getApps?.() || [];
      return apps;
    } catch (error) {
      console.error('Failed to get available apps:', error);
      // Return empty array if API call fails
      return [];
    }
  }

  async executeAction(accountId: string, action: string, params: Record<string, any>) {
    try {
      console.log(`Executing Pipedream action: ${action} with account: ${accountId}`);
      
      // Use Pipedream's component execution API
      const response = await fetch(`https://api.pipedream.com/v1/components/actions/${action}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PIPEDREAM_CONFIG.clientSecret}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account_id: accountId,
          params: params
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Pipedream action execution failed: ${response.statusText} - ${errorData}`);
      }

      const result = await response.json();
      console.log('Pipedream action result:', result);
      return result;
    } catch (error) {
      console.error('Failed to execute Pipedream action:', error);
      throw error;
    }
  }

  async createWorkflow(externalUserId: string, workflowConfig: any) {
    try {
      const workflow = await this.client.createWorkflow?.({
        external_user_id: externalUserId,
        ...workflowConfig
      });
      
      console.log('Created Pipedream workflow:', workflow);
      return workflow;
    } catch (error) {
      console.error('Failed to create Pipedream workflow:', error);
      throw error;
    }
  }

  async testConnection(accountId: string): Promise<boolean> {
    try {
      // Test the connection by trying to get account info
      const response = await fetch(`https://api.pipedream.com/v1/accounts/${accountId}`, {
        headers: {
          'Authorization': `Bearer ${PIPEDREAM_CONFIG.clientSecret}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Pipedream connection test failed:', error);
      return false;
    }
  }
}

export const pipedreamService = new PipedreamService();
