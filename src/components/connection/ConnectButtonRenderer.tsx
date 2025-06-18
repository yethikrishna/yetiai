
import { Platform } from "@/types/platform";
import { Button } from "@/components/ui/button";

interface ConnectButtonRendererProps {
  platform: Platform;
  isSupported: boolean;
  credentials: Record<string, string>;
  isConnecting: boolean;
  isGitHubAuthing: boolean;
  isGmailAuthing: boolean;
  isTwitterAuthing: boolean;
  isFacebookAuthing: boolean;
  isInstagramAuthing: boolean;
  isLinkedInAuthing: boolean;
  isTikTokAuthing: boolean;
  isKooAuthing: boolean;
  isShareChatAuthing: boolean;
  handleConnect: () => void;
  handleGitHubOAuth: () => void;
  handleGmailOAuth: () => void;
  handleTwitterOAuth: () => void;
  handleFacebookOAuth: () => void;
  handleInstagramOAuth: () => void;
  handleLinkedInOAuth: () => void;
  handleTikTokOAuth: () => void;
  handleKooOAuth: () => void;
  handleShareChatOAuth: () => void;
}

export function ConnectButtonRenderer({
  platform,
  isSupported,
  credentials,
  isConnecting,
  isGitHubAuthing,
  isGmailAuthing,
  isTwitterAuthing,
  isFacebookAuthing,
  isInstagramAuthing,
  isLinkedInAuthing,
  isTikTokAuthing,
  isKooAuthing,
  isShareChatAuthing,
  handleConnect,
  handleGitHubOAuth,
  handleGmailOAuth,
  handleTwitterOAuth,
  handleFacebookOAuth,
  handleInstagramOAuth,
  handleLinkedInOAuth,
  handleTikTokOAuth,
  handleKooOAuth,
  handleShareChatOAuth,
}: ConnectButtonRendererProps) {
  if (!isSupported) {
    return (
      <Button disabled>
        Coming Soon
      </Button>
    );
  }

  switch (platform.id) {
    case "github":
      return (
        <Button 
          onClick={handleConnect} 
          disabled={isConnecting || !credentials.token}
        >
          {isConnecting ? "Connecting..." : "Connect with Token"}
        </Button>
      );
    
    case "gmail":
      return (
        <Button 
          onClick={handleGmailOAuth} 
          disabled={isGmailAuthing}
        >
          {isGmailAuthing ? "Redirecting to Google..." : "Connect with Gmail"}
        </Button>
      );
    
    case "twitter":
      return (
        <Button 
          onClick={handleTwitterOAuth} 
          disabled={isTwitterAuthing || !credentials.clientId || !credentials.clientSecret}
        >
          {isTwitterAuthing ? "Redirecting..." : "Connect with Twitter"}
        </Button>
      );
    
    case "facebook":
      return (
        <Button 
          onClick={handleFacebookOAuth} 
          disabled={isFacebookAuthing || !credentials.appId || !credentials.appSecret}
        >
          {isFacebookAuthing ? "Redirecting..." : "Connect with Facebook"}
        </Button>
      );
    
    case "instagram":
      return (
        <Button 
          onClick={handleInstagramOAuth} 
          disabled={isInstagramAuthing || !credentials.appId || !credentials.appSecret}
        >
          {isInstagramAuthing ? "Redirecting..." : "Connect with Instagram"}
        </Button>
      );
    
    case "linkedin":
      return (
        <Button 
          onClick={handleLinkedInOAuth} 
          disabled={isLinkedInAuthing || !credentials.clientId || !credentials.clientSecret}
        >
          {isLinkedInAuthing ? "Redirecting..." : "Connect with LinkedIn"}
        </Button>
      );
    
    case "tiktok":
      return (
        <Button 
          onClick={handleTikTokOAuth} 
          disabled={isTikTokAuthing || !credentials.clientId || !credentials.clientSecret}
        >
          {isTikTokAuthing ? "Redirecting..." : "Connect with TikTok"}
        </Button>
      );
    
    case "koo":
      return (
        <Button 
          onClick={handleKooOAuth} 
          disabled={isKooAuthing || !credentials.email || !credentials.password}
        >
          {isKooAuthing ? "Connecting..." : "Connect to Koo"}
        </Button>
      );
    
    case "sharechat":
      return (
        <Button 
          onClick={handleShareChatOAuth} 
          disabled={isShareChatAuthing || !credentials.phone || !credentials.password}
        >
          {isShareChatAuthing ? "Connecting..." : "Connect to ShareChat"}
        </Button>
      );
    
    default:
      return (
        <Button 
          onClick={handleConnect} 
          disabled={isConnecting}
        >
          {isConnecting ? "Connecting..." : "Connect"}
        </Button>
      );
  }
}
