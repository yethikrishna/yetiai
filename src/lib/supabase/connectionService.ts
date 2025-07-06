
import { supabase } from '@/integrations/supabase/client';
import { ConnectionConfig } from '@/types/platform';

export interface SupabaseConnection {
  id: string;
  user_id: string;
  platform_id: string;
  platform_name: string;
  credentials: Record<string, any>;
  settings: Record<string, any>;
  is_active: boolean;
  last_connected: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExecutionLog {
  id: string;
  user_id: string;
  platform_id: string;
  action: string;
  request_data: Record<string, any> | null;
  response_data: Record<string, any> | null;
  status: 'success' | 'error' | 'pending';
  error_message: string | null;
  execution_time_ms: number | null;
  created_at: string;
}

export interface OAuthState {
  id: string;
  user_id: string;
  platform_id: string;
  state_token: string;
  redirect_uri: string | null;
  expires_at: string;
  created_at: string;
}

// Helper function to safely convert Json to Record<string, any>
const jsonToRecord = (json: any): Record<string, any> => {
  if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
    return json as Record<string, any>;
  }
  return {};
};

// Helper function to safely cast status to the expected union type
const castStatus = (status: string): 'success' | 'error' | 'pending' => {
  if (status === 'success' || status === 'error' || status === 'pending') {
    return status;
  }
  return 'pending'; // fallback to pending if status is not one of the expected values
};

export class ConnectionService {
  static async getUserConnections(userId: string): Promise<SupabaseConnection[]> {
    // Since user_connections table doesn't exist yet, return empty array
    console.log('Would fetch connections for user:', userId);
    return [];
  }

  static async saveConnection(userId: string, connection: ConnectionConfig, platformName: string): Promise<SupabaseConnection> {
    // Since user_connections table doesn't exist yet, return mock data
    console.log('Would save connection for user:', userId, connection);
    
    return {
      id: crypto.randomUUID(),
      user_id: userId,
      platform_id: connection.platformId,
      platform_name: platformName,
      credentials: connection.credentials,
      settings: connection.settings,
      is_active: connection.isActive,
      last_connected: connection.lastConnected?.toISOString() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  static async deactivateConnection(userId: string, platformId: string): Promise<void> {
    // Since user_connections table doesn't exist yet, just log
    console.log('Would deactivate connection for user:', userId, 'platform:', platformId);
  }

  static async logExecution(
    userId: string,
    platformId: string,
    action: string,
    requestData?: any,
    responseData?: any,
    status: 'success' | 'error' | 'pending' = 'pending',
    errorMessage?: string,
    executionTimeMs?: number
  ): Promise<ExecutionLog> {
    // Since mcp_execution_logs table doesn't exist yet, return mock data
    console.log('Would log execution for user:', userId, 'platform:', platformId, 'action:', action);
    
    return {
      id: crypto.randomUUID(),
      user_id: userId,
      platform_id: platformId,
      action,
      request_data: requestData || null,
      response_data: responseData || null,
      status,
      error_message: errorMessage || null,
      execution_time_ms: executionTimeMs || null,
      created_at: new Date().toISOString()
    };
  }

  static async getExecutionLogs(userId: string, platformId?: string, limit: number = 50): Promise<ExecutionLog[]> {
    // Since mcp_execution_logs table doesn't exist yet, return empty array
    console.log('Would fetch execution logs for user:', userId, 'platform:', platformId);
    return [];
  }

  static async createOAuthState(
    userId: string,
    platformId: string,
    stateToken: string,
    redirectUri?: string
  ): Promise<OAuthState> {
    // Since oauth_states table doesn't exist yet, return mock data
    console.log('Would create OAuth state for user:', userId, 'platform:', platformId);
    
    return {
      id: crypto.randomUUID(),
      user_id: userId,
      platform_id: platformId,
      state_token: stateToken,
      redirect_uri: redirectUri || null,
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      created_at: new Date().toISOString()
    };
  }

  static async validateOAuthState(stateToken: string): Promise<OAuthState | null> {
    // Since oauth_states table doesn't exist yet, return null
    console.log('Would validate OAuth state:', stateToken);
    return null;
  }

  static async cleanupExpiredOAuthStates(): Promise<void> {
    // Since oauth_states table doesn't exist yet, just log
    console.log('Would cleanup expired OAuth states');
  }
}
