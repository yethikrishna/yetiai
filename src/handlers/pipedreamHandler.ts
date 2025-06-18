
import { ConnectionConfig } from '@/types/platform';
import { pipedreamService } from '@/lib/pipedream/pipedreamService';

export const pipedreamHandler = {
  name: 'Pipedream',
  
  async connect(credentials: Record<string, string>): Promise<boolean> {
    try {
      console.log('Connecting to Pipedream with credentials:', credentials);
      
      // For Pipedream, the connection is established through OAuth
      // The actual connection happens in the frontend with the SDK
      // We just validate that we have the necessary information
      
      if (credentials.accountId) {
        // Test the connection if we have an account ID
        const isValid = await pipedreamService.testConnection(credentials.accountId);
        if (!isValid) {
          throw new Error('Failed to validate Pipedream connection');
        }
      }
      
      console.log('Pipedream connection successful');
      return true;
    } catch (error) {
      console.error('Pipedream connection failed:', error);
      throw new Error('Failed to connect to Pipedream. Please check your credentials and try again.');
    }
  },

  async disconnect(connection: ConnectionConfig): Promise<void> {
    try {
      console.log('Disconnecting from Pipedream...');
      
      // In a production environment, you might want to revoke tokens
      // For now, we just clear the local connection data
      
      console.log('Pipedream disconnection completed');
    } catch (error) {
      console.error('Error disconnecting from Pipedream:', error);
      throw new Error('Failed to disconnect from Pipedream.');
    }
  },

  async test(connection: ConnectionConfig): Promise<boolean> {
    try {
      console.log('Testing Pipedream connection...');
      
      if (!connection.credentials.accountId) {
        console.log('No account ID found, connection test skipped');
        return true; // Allow flexible connections without specific account ID
      }
      
      // Test the connection by checking account status
      const isValid = await pipedreamService.testConnection(connection.credentials.accountId);
      
      if (isValid) {
        console.log('Pipedream connection test successful');
        return true;
      } else {
        console.log('Pipedream connection test failed');
        return false;
      }
    } catch (error) {
      console.error('Pipedream connection test failed:', error);
      return false;
    }
  },

  // Additional methods for Pipedream-specific operations
  async getConnectedAccounts(userId: string): Promise<any[]> {
    try {
      return await pipedreamService.getAccounts(userId);
    } catch (error) {
      console.error('Failed to get Pipedream accounts:', error);
      return [];
    }
  },

  async executeAction(accountId: string, action: string, params: Record<string, any>): Promise<any> {
    try {
      return await pipedreamService.executeAction(accountId, action, params);
    } catch (error) {
      console.error('Failed to execute Pipedream action:', error);
      throw error;
    }
  }
};
