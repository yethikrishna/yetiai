
import { createBackendClient } from "@pipedream/sdk/server";

const PIPEDREAM_CONFIG = {
  clientId: 'cfz9GEESE7FO31sbLJnX4v93DGqwpy1mPlZhSwPNMWg',
  clientSecret: 'X_hpK7GecetqL7Y2qFWtrQQgH1sJBuD6fQwxAQ_N4QM',
  projectId: 'proj_Los2XgZ',
  environment: 'production' as const
};

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
      const result = await this.client.createConnectToken({
        external_user_id: externalUserId,
        ...(app && { app })
      });
      
      console.log('Created Pipedream connect token:', result);
      return result;
    } catch (error) {
      console.error('Failed to create Pipedream connect token:', error);
      throw error;
    }
  }

  async getAccounts(externalUserId: string) {
    try {
      const accounts = await this.client.getAccounts({
        external_user_id: externalUserId
      });
      
      return accounts;
    } catch (error) {
      console.error('Failed to get Pipedream accounts:', error);
      throw error;
    }
  }

  async executeAction(accountId: string, action: string, params: Record<string, any>) {
    try {
      // Use Pipedream's action execution API
      const response = await fetch(`https://api.pipedream.com/v1/accounts/${accountId}/actions/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accountId}`, // Use proper auth token
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`Pipedream action execution failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to execute Pipedream action:', error);
      throw error;
    }
  }
}

export const pipedreamService = new PipedreamService();
