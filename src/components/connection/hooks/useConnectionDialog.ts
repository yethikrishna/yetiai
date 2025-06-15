
import { useState } from "react";
import { Platform } from "@/types/platform";
import { useToast } from "@/hooks/use-toast";
import { isPlatformSupported } from "@/handlers/platformHandlers";
import { useOAuthHandlers } from "./useOAuthHandlers";

interface UseConnectionDialogProps {
  platform: Platform | null;
  onConnect: (platformId: string, credentials: Record<string, string>) => Promise<boolean>;
  onClose: () => void;
}

export function useConnectionDialog({ platform, onConnect, onClose }: UseConnectionDialogProps) {
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const isSupported = platform ? isPlatformSupported(platform.id) : false;

  const oauthHandlers = useOAuthHandlers({
    platform,
    credentials,
    onConnect,
  });

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

  return {
    credentials,
    setCredentials,
    isConnecting,
    isSupported,
    handleConnect,
    handleClose,
    ...oauthHandlers,
  };
}
