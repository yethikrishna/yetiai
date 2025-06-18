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
  description?: string;
}

export class PipedreamService {
  private client: any;
  private appsCache: PipedreamApp[] = [];
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
      // Check cache first
      const now = Date.now();
      if (this.appsCache.length > 0 && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
        console.log('Returning cached Pipedream apps');
        return this.appsCache;
      }

      console.log('Fetching Pipedream apps from API...');
      
      // Try to get apps from the client first
      let apps: PipedreamApp[] = [];
      
      try {
        apps = await this.client.getApps?.() || [];
      } catch (clientError) {
        console.warn('Client getApps failed, trying direct API call:', clientError);
        
        // Fallback to direct API call
        const response = await fetch('https://api.pipedream.com/v1/apps', {
          headers: {
            'Authorization': `Bearer ${PIPEDREAM_CONFIG.clientSecret}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          apps = data.data || data || [];
        } else {
          console.warn('Direct API call also failed, using fallback list');
          // Return a curated list of popular apps if API fails
          apps = this.getFallbackAppsList();
        }
      }

      // Cache the results
      this.appsCache = apps;
      this.cacheTimestamp = now;
      
      console.log(`Retrieved ${apps.length} Pipedream apps`);
      return apps;
    } catch (error) {
      console.error('Failed to get available apps:', error);
      // Return fallback list on any error
      return this.getFallbackAppsList();
    }
  }

  private getFallbackAppsList(): PipedreamApp[] {
    // Return a curated list of popular apps that are definitely supported
    return [
      {
        name: 'Google Sheets',
        name_slug: 'google_sheets',
        auth_type: 'oauth',
        categories: ['productivity', 'spreadsheets'],
        description: 'Create, edit, and share spreadsheets online'
      },
      {
        name: 'Slack',
        name_slug: 'slack',
        auth_type: 'oauth',
        categories: ['communication', 'team'],
        description: 'Team collaboration and messaging platform'
      },
      {
        name: 'Gmail',
        name_slug: 'gmail',
        auth_type: 'oauth',
        categories: ['email', 'google'],
        description: 'Send and receive emails through Gmail'
      },
      {
        name: 'Discord',
        name_slug: 'discord',
        auth_type: 'oauth',
        categories: ['communication', 'gaming'],
        description: 'Voice, video and text communication for communities'
      },
      {
        name: 'Notion',
        name_slug: 'notion',
        auth_type: 'oauth',
        categories: ['productivity', 'notes'],
        description: 'All-in-one workspace for notes, docs, and collaboration'
      },
      {
        name: 'Airtable',
        name_slug: 'airtable',
        auth_type: 'oauth',
        categories: ['database', 'productivity'],
        description: 'Cloud-based relational database platform'
      },
      {
        name: 'GitHub',
        name_slug: 'github',
        auth_type: 'oauth',
        categories: ['development', 'version-control'],
        description: 'Code hosting and version control platform'
      },
      {
        name: 'Stripe',
        name_slug: 'stripe',
        auth_type: 'api_key',
        categories: ['payment', 'ecommerce'],
        description: 'Online payment processing platform'
      },
      {
        name: 'Shopify',
        name_slug: 'shopify',
        auth_type: 'oauth',
        categories: ['ecommerce', 'retail'],
        description: 'E-commerce platform for online stores'
      },
      {
        name: 'HubSpot',
        name_slug: 'hubspot',
        auth_type: 'oauth',
        categories: ['crm', 'marketing'],
        description: 'Customer relationship management platform'
      },
      {
        name: 'Salesforce',
        name_slug: 'salesforce',
        auth_type: 'oauth',
        categories: ['crm', 'sales'],
        description: 'Customer relationship management platform'
      },
      {
        name: 'Twitter',
        name_slug: 'twitter',
        auth_type: 'oauth',
        categories: ['social', 'media'],
        description: 'Social media platform for short messages'
      },
      {
        name: 'Facebook',
        name_slug: 'facebook',
        auth_type: 'oauth',
        categories: ['social', 'media'],
        description: 'Social networking platform'
      },
      {
        name: 'LinkedIn',
        name_slug: 'linkedin',
        auth_type: 'oauth',
        categories: ['social', 'professional'],
        description: 'Professional networking platform'
      },
      {
        name: 'Instagram',
        name_slug: 'instagram',
        auth_type: 'oauth',
        categories: ['social', 'media'],
        description: 'Photo and video sharing platform'
      },
      {
        name: 'YouTube',
        name_slug: 'youtube',
        auth_type: 'oauth',
        categories: ['media', 'video'],
        description: 'Video sharing and streaming platform'
      },
      {
        name: 'Zoom',
        name_slug: 'zoom',
        auth_type: 'oauth',
        categories: ['communication', 'video'],
        description: 'Video conferencing platform'
      },
      {
        name: 'Microsoft Teams',
        name_slug: 'microsoft_teams',
        auth_type: 'oauth',
        categories: ['communication', 'microsoft'],
        description: 'Team collaboration and communication platform'
      },
      {
        name: 'Trello',
        name_slug: 'trello',
        auth_type: 'oauth',
        categories: ['productivity', 'project-management'],
        description: 'Visual project management tool'
      },
      {
        name: 'Asana',
        name_slug: 'asana',
        auth_type: 'oauth',
        categories: ['productivity', 'project-management'],
        description: 'Team task and project management platform'
      }
    ];
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
