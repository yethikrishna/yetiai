
import { useState } from "react";
import { Platform } from "@/types/platform";
import { useConnectionState } from "./useConnectionState";
import { useConnectionHandler } from "./useConnectionHandler";
import { useOAuthHandlers } from "./useOAuthHandlers";
import { usePipedreamConnect } from "@/hooks/usePipedreamConnect";

interface UseConnectionDialogProps {
  platform: Platform | null;
  onConnect: (platformId: string, credentials: Record<string, string>) => Promise<boolean>;
  onClose: () => void;
}

export function useConnectionDialog({ platform, onConnect, onClose }: UseConnectionDialogProps) {
  const { credentials, setCredentials, resetCredentials } = useConnectionState(platform);
  const [isConnecting, setIsConnecting] = useState(false);
  const { connectAccount: pipedreamConnect, isConnecting: isPipedreamConnecting } = usePipedreamConnect();
  
  const { isSupported, handleConnect, handleClose } = useConnectionHandler({
    platform,
    credentials,
    isConnecting,
    setIsConnecting,
    onConnect,
    onClose,
    resetCredentials,
  });

  const {
    isGitHubAuthing,
    isGmailAuthing,
    isTwitterAuthing,
    isFacebookAuthing,
    isInstagramAuthing,
    isLinkedInAuthing,
    isTikTokAuthing,
    isKooAuthing,
    isShareChatAuthing,
    handleGitHubOAuth,
    handleGmailOAuth,
    handleTwitterOAuth,
    handleFacebookOAuth,
    handleInstagramOAuth,
    handleLinkedInOAuth,
    handleTikTokOAuth,
    handleKooOAuth,
    handleShareChatOAuth,
  } = useOAuthHandlers({ platform, onConnect, onClose, resetCredentials });

  const handlePipedreamConnect = async () => {
    if (!platform) return;
    
    setIsConnecting(true);
    try {
      const account = await pipedreamConnect(credentials.app);
      if (account) {
        // Store the account info as credentials
        const success = await onConnect(platform.id, {
          accountId: account.id,
          app: credentials.app || 'all',
          ...account
        });
        if (success) {
          onClose();
          resetCredentials();
        }
      }
    } catch (error) {
      console.error('Pipedream connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Override the main connect handler for Pipedream
  const finalHandleConnect = platform?.id === 'pipedream' ? handlePipedreamConnect : handleConnect;

  return {
    credentials,
    setCredentials,
    isConnecting: isConnecting || isPipedreamConnecting,
    isGitHubAuthing,
    isGmailAuthing,
    isTwitterAuthing,
    isFacebookAuthing,
    isInstagramAuthing,
    isLinkedInAuthing,
    isTikTokAuthing,
    isKooAuthing,
    isShareChatAuthing,
    isSupported,
    handleConnect: finalHandleConnect,
    handleClose,
    handleGitHubOAuth,
    handleGmailOAuth,
    handleTwitterOAuth,
    handleFacebookOAuth,
    handleInstagramOAuth,
    handleLinkedInOAuth,
    handleTikTokOAuth,
    handleKooOAuth,
    handleShareChatOAuth,
  };
}
