import { Platform } from "@/types/platform";
import { useConnectionState } from "./useConnectionState";
import { useConnectionHandler } from "./useConnectionHandler";
import { useOAuthHandlers } from "./useOAuthHandlers";

interface UseConnectionDialogProps {
  platform: Platform | null;
  onConnect: (platformId: string, credentials: Record<string, string>) => Promise<boolean>;
  onClose: () => void;
}

export function useConnectionDialog({ platform, onConnect, onClose }: UseConnectionDialogProps) {
  const {
    credentials,
    setCredentials,
    isConnecting,
    setIsConnecting,
    resetCredentials,
  } = useConnectionState();

  const {
    isSupported,
    handleConnect,
    handleClose,
  } = useConnectionHandler({
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
  } = useOAuthHandlers({
    platform,
    credentials,
    onConnect,
  });

  return {
    credentials,
    setCredentials,
    isConnecting,
    isSupported,
    handleConnect,
    handleClose,
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
  };
}
