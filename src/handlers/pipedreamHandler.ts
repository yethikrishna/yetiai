
import { ConnectionConfig } from '@/types/platform';

export const pipedreamHandler = {
  name: 'Pipedream',
  
  async connect(credentials: Record<string, string>): Promise<boolean> {
    try {
      console.log('Connecting to Pipedream...');
      // OAuth flow will be handled by the frontend SDK
      return true;
    } catch (error) {
      console.error('Pipedream connection failed:', error);
      throw new Error('Failed to connect to Pipedream. Please check your credentials.');
    }
  },

  async disconnect(connection: ConnectionConfig): Promise<void> {
    try {
      console.log('Disconnecting from Pipedream...');
      // Clear any stored tokens
    } catch (error) {
      console.error('Error disconnecting from Pipedream:', error);
      throw new Error('Failed to disconnect from Pipedream.');
    }
  },

  async test(connection: ConnectionConfig): Promise<boolean> {
    try {
      // Test the connection by making a simple API call
      const response = await fetch('https://api.pipedream.com/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${connection.credentials.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Pipedream connection test failed:', error);
      return false;
    }
  }
};
