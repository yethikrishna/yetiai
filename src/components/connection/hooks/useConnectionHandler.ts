
import { Platform } from "@/types/platform";
import { useToast } from "@/hooks/use-toast";
import { isPlatformSupported } from "@/handlers/platformHandlers";

interface UseConnectionHandlerProps {
  platform: Platform | null;
  credentials: Record<string, string>;
  isConnecting: boolean;
  setIsConnecting: (connecting: boolean) => void;
  onConnect: (platformId: string, credentials: Record<string, string>) => Promise<boolean>;
  onClose: () => void;
  resetCredentials: () => void;
}

export function useConnectionHandler({
  platform,
  credentials,
  isConnecting,
  setIsConnecting,
  onConnect,
  onClose,
  resetCredentials,
}: UseConnectionHandlerProps) {
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
        resetCredentials();
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
    resetCredentials();
  };

  return {
    isSupported,
    handleConnect,
    handleClose,
  };
}
