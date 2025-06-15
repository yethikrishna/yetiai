
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
    const { data, error } = await supabase
      .from('user_connections')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user connections:', error);
      throw error;
    }

    return (data || []).map(conn => ({
      ...conn,
      credentials: jsonToRecord(conn.credentials),
      settings: jsonToRecord(conn.settings)
    }));
  }

  static async saveConnection(userId: string, connection: ConnectionConfig, platformName: string): Promise<SupabaseConnection> {
    const { data, error } = await supabase
      .from('user_connections')
      .upsert({
        user_id: userId,
        platform_id: connection.platformId,
        platform_name: platformName,
        credentials: connection.credentials,
        settings: connection.settings,
        is_active: connection.isActive,
        last_connected: connection.lastConnected?.toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,platform_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving connection:', error);
      throw error;
    }

    return {
      ...data,
      credentials: jsonToRecord(data.credentials),
      settings: jsonToRecord(data.settings)
    };
  }

  static async deactivateConnection(userId: string, platformId: string): Promise<void> {
    const { error } = await supabase
      .from('user_connections')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('platform_id', platformId);

    if (error) {
      console.error('Error deactivating connection:', error);
      throw error;
    }
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
    const { data, error } = await supabase
      .from('mcp_execution_logs')
      .insert({
        user_id: userId,
        platform_id: platformId,
        action,
        request_data: requestData,
        response_data: responseData,
        status,
        error_message: errorMessage,
        execution_time_ms: executionTimeMs
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging execution:', error);
      throw error;
    }

    return {
      ...data,
      request_data: jsonToRecord(data.request_data),
      response_data: jsonToRecord(data.response_data),
      status: castStatus(data.status)
    };
  }

  static async getExecutionLogs(userId: string, platformId?: string, limit: number = 50): Promise<ExecutionLog[]> {
    let query = supabase
      .from('mcp_execution_logs')
      .select('*')
      .eq('user_id', userId);

    if (platformId) {
      query = query.eq('platform_id', platformId);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching execution logs:', error);
      throw error;
    }

    return (data || []).map(log => ({
      ...log,
      request_data: jsonToRecord(log.request_data),
      response_data: jsonToRecord(log.response_data),
      status: castStatus(log.status)
    }));
  }

  static async createOAuthState(
    userId: string,
    platformId: string,
    stateToken: string,
    redirectUri?: string
  ): Promise<OAuthState> {
    const { data, error } = await supabase
      .from('oauth_states')
      .insert({
        user_id: userId,
        platform_id: platformId,
        state_token: stateToken,
        redirect_uri: redirectUri,
        expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating OAuth state:', error);
      throw error;
    }

    return data;
  }

  static async validateOAuthState(stateToken: string): Promise<OAuthState | null> {
    const { data, error } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state_token', stateToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error) {
      console.error('Error validating OAuth state:', error);
      return null;
    }

    return data;
  }

  static async cleanupExpiredOAuthStates(): Promise<void> {
    const { error } = await supabase.rpc('cleanup_expired_oauth_states');

    if (error) {
      console.error('Error cleaning up expired OAuth states:', error);
    }
  }
}
