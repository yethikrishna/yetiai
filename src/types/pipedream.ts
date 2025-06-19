
export interface PipedreamApp {
  name: string;
  name_slug: string;
  auth_type: 'oauth' | 'api-key' | 'credentials';
  categories: string[];
  description: string;
  custom_fields_json?: any;
  logo_url?: string;
  website_url?: string;
  documentation_url?: string;
  is_verified?: boolean;
  popularity_score?: number;
  last_updated?: string;
}

export interface PipedreamConnection {
  id: string;
  app_slug: string;
  app_name: string;
  auth_type: string;
  connected_at: string;
  last_used?: string;
  status: 'active' | 'inactive' | 'error';
  credentials_hash?: string;
}

export interface PipedreamWorkflow {
  id: string;
  name: string;
  description?: string;
  trigger_app: string;
  actions: PipedreamAction[];
  status: 'active' | 'paused' | 'error';
  created_at: string;
  updated_at: string;
  execution_count?: number;
}

export interface PipedreamAction {
  id: string;
  app_slug: string;
  action_name: string;
  parameters: Record<string, any>;
  order: number;
}

export interface PipedreamExecution {
  id: string;
  workflow_id: string;
  status: 'success' | 'error' | 'running';
  started_at: string;
  completed_at?: string;
  error_message?: string;
  input_data?: any;
  output_data?: any;
  execution_time_ms?: number;
}

export interface PipedreamWebhook {
  id: string;
  url: string;
  workflow_id: string;
  created_at: string;
  last_triggered?: string;
  trigger_count: number;
}

export interface PipedreamApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    has_more: boolean;
  };
}

export interface PipedreamAppCategory {
  id: string;
  name: string;
  description: string;
  app_count: number;
}

export interface PipedreamAuthConfig {
  type: 'oauth' | 'api-key' | 'basic-auth' | 'custom';
  oauth_config?: {
    authorization_url: string;
    token_url: string;
    scopes: string[];
    client_id_required: boolean;
    client_secret_required: boolean;
  };
  api_key_config?: {
    header_name: string;
    query_param_name?: string;
    prefix?: string;
  };
  custom_fields?: Array<{
    name: string;
    type: 'text' | 'password' | 'url' | 'email';
    required: boolean;
    description?: string;
  }>;
}

export interface PipedreamAppAction {
  id: string;
  name: string;
  description: string;
  app_slug: string;
  parameters: Array<{
    name: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required: boolean;
    description?: string;
    default_value?: any;
    options?: any[];
  }>;
  returns: {
    type: string;
    description: string;
    schema?: object;
  };
}

export interface PipedreamAppTrigger {
  id: string;
  name: string;
  description: string;
  app_slug: string;
  type: 'webhook' | 'polling' | 'instant';
  configuration: {
    webhook_url?: string;
    polling_interval?: number;
    parameters: Record<string, any>;
  };
}
