import { useState } from "react";
import { Platform } from "@/types/platform";
import { useToast } from "@/hooks/use-toast";

interface UseOAuthHandlersProps {
  platform: Platform | null;
  onConnect: (platformId: string, credentials: Record<string, string>) => Promise<boolean>;
  onClose: () => void;
  resetCredentials: () => void;
}

export function useOAuthHandlers({ platform, onConnect, onClose, resetCredentials }: UseOAuthHandlersProps) {
  const [isGitHubAuthing, setIsGitHubAuthing] = useState(false);
  const [isGmailAuthing, setIsGmailAuthing] = useState(false);
  const [isTwitterAuthing, setIsTwitterAuthing] = useState(false);
  const [isFacebookAuthing, setIsFacebookAuthing] = useState(false);
  const [isInstagramAuthing, setIsInstagramAuthing] = useState(false);
  const [isLinkedInAuthing, setIsLinkedInAuthing] = useState(false);
  const [isTikTokAuthing, setIsTikTokAuthing] = useState(false);
  const [isKooAuthing, setIsKooAuthing] = useState(false);
  const [isShareChatAuthing, setIsShareChatAuthing] = useState(false);
  const { toast } = useToast();

  const handleGitHubOAuth = () => {
    if (!platform) return;
    
    setIsGitHubAuthing(true);
    try {
      onConnect(platform.id, {});
    } catch (err) {
      setIsGitHubAuthing(false);
      toast({
        title: "GitHub OAuth failed",
        description: err instanceof Error ? err.message : "Could not start OAuth2.",
        variant: "destructive",
      });
    }
  };

  const handleGmailOAuth = () => {
    if (!platform) return;
    
    setIsGmailAuthing(true);
    try {
      onConnect(platform.id, {});
    } catch (err) {
      setIsGmailAuthing(false);
      toast({
        title: "Gmail OAuth failed",
        description: err instanceof Error ? err.message : "Could not start Gmail OAuth.",
        variant: "destructive",
      });
    }
  };

  const handleTwitterOAuth = () => {
    if (!platform) return;
    
    if (!credentials.clientId || !credentials.clientSecret) {
      toast({
        title: "Missing Credentials",
        description: "Please enter your Twitter Client ID and Client Secret first.",
        variant: "destructive",
      });
      return;
    }

    setIsTwitterAuthing(true);
    try {
      onConnect(platform.id, credentials);
    } catch (err) {
      setIsTwitterAuthing(false);
      toast({
        title: "Twitter OAuth failed",
        description: err instanceof Error ? err.message : "Could not start OAuth2.",
        variant: "destructive",
      });
    }
  };

  const handleFacebookOAuth = () => {
    if (!platform) return;
    
    if (!credentials.appId || !credentials.appSecret) {
      toast({
        title: "Missing Credentials",
        description: "Please enter your Facebook App ID and App Secret first.",
        variant: "destructive",
      });
      return;
    }

    setIsFacebookAuthing(true);
    try {
      onConnect(platform.id, credentials);
    } catch (err) {
      setIsFacebookAuthing(false);
      toast({
        title: "Facebook OAuth failed",
        description: err instanceof Error ? err.message : "Could not start OAuth2.",
        variant: "destructive",
      });
    }
  };

  const handleInstagramOAuth = () => {
    if (!platform) return;
    
    if (!credentials.appId || !credentials.appSecret) {
      toast({
        title: "Missing Credentials",
        description: "Please enter your Facebook App ID and App Secret first.",
        variant: "destructive",
      });
      return;
    }

    setIsInstagramAuthing(true);
    try {
      onConnect(platform.id, credentials);
    } catch (err) {
      setIsInstagramAuthing(false);
      toast({
        title: "Instagram OAuth failed",
        description: err instanceof Error ? err.message : "Could not start OAuth2.",
        variant: "destructive",
      });
    }
  };

  const handleLinkedInOAuth = () => {
    if (!platform) return;
    
    if (!credentials.clientId || !credentials.clientSecret) {
      toast({
        title: "Missing Credentials",
        description: "Please enter your LinkedIn Client ID and Client Secret first.",
        variant: "destructive",
      });
      return;
    }

    setIsLinkedInAuthing(true);
    try {
      onConnect(platform.id, credentials);
    } catch (err) {
      setIsLinkedInAuthing(false);
      toast({
        title: "LinkedIn OAuth failed",
        description: err instanceof Error ? err.message : "Could not start OAuth2.",
        variant: "destructive",
      });
    }
  };

  const handleTikTokOAuth = () => {
    if (!platform) return;
    
    if (!credentials.clientId || !credentials.clientSecret) {
      toast({
        title: "Missing Credentials",
        description: "Please enter your TikTok Client ID and Client Secret first.",
        variant: "destructive",
      });
      return;
    }

    setIsTikTokAuthing(true);
    try {
      onConnect(platform.id, credentials);
    } catch (err) {
      setIsTikTokAuthing(false);
      toast({
        title: "TikTok OAuth failed",
        description: err instanceof Error ? err.message : "Could not start OAuth2.",
        variant: "destructive",
      });
    }
  };

  const handleKooOAuth = () => {
    if (!platform) return;
    
    if (!credentials.email || !credentials.password) {
      toast({
        title: "Missing Credentials",
        description: "Please enter your Koo email and password first.",
        variant: "destructive",
      });
      return;
    }

    setIsKooAuthing(true);
    try {
      onConnect(platform.id, credentials);
    } catch (err) {
      setIsKooAuthing(false);
      toast({
        title: "Koo connection failed",
        description: err instanceof Error ? err.message : "Could not connect to Koo.",
        variant: "destructive",
      });
    }
  };

  const handleShareChatOAuth = () => {
    if (!platform) return;
    
    if (!credentials.phone || !credentials.password) {
      toast({
        title: "Missing Credentials",
        description: "Please enter your ShareChat phone and password first.",
        variant: "destructive",
      });
      return;
    }

    setIsShareChatAuthing(true);
    try {
      onConnect(platform.id, credentials);
    } catch (err) {
      setIsShareChatAuthing(false);
      toast({
        title: "ShareChat connection failed",
        description: err instanceof Error ? err.message : "Could not connect to ShareChat.",
        variant: "destructive",
      });
    }
  };

  return {
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
