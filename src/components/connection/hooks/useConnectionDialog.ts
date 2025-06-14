import { useState } from "react";
import { Platform } from "@/types/platform";
import { useToast } from "@/hooks/use-toast";
import { isPlatformSupported } from "@/handlers/platformHandlers";

interface UseConnectionDialogProps {
  platform: Platform | null;
  onConnect: (platformId: string, credentials: Record<string, string>) => Promise<boolean>;
  onClose: () => void;
}

export function useConnectionDialog({ platform, onConnect, onClose }: UseConnectionDialogProps) {
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [isGitHubAuthing, setIsGitHubAuthing] = useState(false);
  const [isTwitterAuthing, setIsTwitterAuthing] = useState(false);
  const [isFacebookAuthing, setIsFacebookAuthing] = useState(false);
  const [isInstagramAuthing, setIsInstagramAuthing] = useState(false);
  const { toast } = useToast();

  const isSupported = platform ? isPlatformSupported(platform.id) : false;

  const handleConnect = async () => {
    if (!platform || !isSupported) {
      toast({
        title: "Coming Soon",
        description: `${platform?.name} connection will be available in a future release.`,
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const success = await onConnect(platform.id, credentials);
      if (success) {
        toast({
          title: "Connected Successfully",
          description: `${platform.name} has been connected to Yeti.`,
        });
        onClose();
        setCredentials({});
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setCredentials({});
  };

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

  return {
    credentials,
    setCredentials,
    isConnecting,
    isGitHubAuthing,
    isTwitterAuthing,
    isFacebookAuthing,
    isInstagramAuthing,
    isSupported,
    handleConnect,
    handleClose,
    handleGitHubOAuth,
    handleTwitterOAuth,
    handleFacebookOAuth,
    handleInstagramOAuth,
  };
}
