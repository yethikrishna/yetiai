
import { useState } from 'react';
import { createFrontendClient } from "@pipedream/sdk/browser";
import { useUser } from '@clerk/clerk-react';
import { useToast } from './use-toast';
import { pipedreamService } from '@/lib/pipedream/pipedreamService';

export function usePipedreamConnect() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { user } = useUser();
  const { toast } = useToast();

  const connectAccount = async (app?: string) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    setIsConnecting(true);
    
    try {
      // Generate a connect token from your backend
      const { token, connect_link_url } = await pipedreamService.createConnectToken(
        user.id,
        app
      );

      console.log('Generated Pipedream token:', token);

      // Use the frontend SDK to connect the account
      const pd = createFrontendClient();
      
      return new Promise((resolve, reject) => {
        pd.connectAccount({
          app: app || undefined,
          token,
          onSuccess: (account: any) => {
            console.log(`Account successfully connected:`, account);
            toast({
              title: "Account Connected",
              description: `Successfully connected ${app || 'Pipedream'} account`,
            });
            resolve(account);
          },
          onError: (err: any) => {
            console.error(`Connection error:`, err);
            toast({
              title: "Connection Failed",
              description: err.message || "Failed to connect account",
              variant: "destructive",
            });
            reject(err);
          }
        });
      });
    } catch (error) {
      console.error('Failed to initiate connection:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to initiate connection process",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const getConnectLink = async (app?: string) => {
    if (!user) {
      throw new Error('User must be authenticated');
    }

    try {
      const { connect_link_url } = await pipedreamService.createConnectToken(
        user.id,
        app
      );
      return connect_link_url;
    } catch (error) {
      console.error('Failed to generate connect link:', error);
      throw error;
    }
  };

  return {
    connectAccount,
    getConnectLink,
    isConnecting
  };
}
