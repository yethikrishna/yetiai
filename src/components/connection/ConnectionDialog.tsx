
import { Platform } from "@/types/platform";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useConnectionDialog } from "./hooks/useConnectionDialog";
import { AuthFieldsRenderer } from "./AuthFieldsRenderer";
import { ConnectButtonRenderer } from "./ConnectButtonRenderer";

interface ConnectionDialogProps {
  platform: Platform | null;
  isOpen: boolean;
  onClose: () => void;
  onConnect: (platformId: string, credentials: Record<string, string>) => Promise<boolean>;
}

export function ConnectionDialog({ platform, isOpen, onClose, onConnect }: ConnectionDialogProps) {
  const {
    credentials,
    setCredentials,
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
    isSupported,
    handleConnect,
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
  } = useConnectionDialog({ platform, onConnect, onClose });

  if (!platform) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {platform.icon}
            Connect to {platform.name}
            {isSupported && (
              <Badge className="bg-green-100 text-green-800">
                Phase 1
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {platform.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <AuthFieldsRenderer
            platform={platform}
            isSupported={isSupported}
            credentials={credentials}
            setCredentials={setCredentials}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <ConnectButtonRenderer
            platform={platform}
            isSupported={isSupported}
            credentials={credentials}
            isConnecting={isConnecting}
            isGitHubAuthing={isGitHubAuthing}
            isGmailAuthing={isGmailAuthing}
            isTwitterAuthing={isTwitterAuthing}
            isFacebookAuthing={isFacebookAuthing}
            isInstagramAuthing={isInstagramAuthing}
            isLinkedInAuthing={isLinkedInAuthing}
            isTikTokAuthing={isTikTokAuthing}
            isKooAuthing={isKooAuthing}
            isShareChatAuthing={isShareChatAuthing}
            handleConnect={handleConnect}
            handleGitHubOAuth={handleGitHubOAuth}
            handleGmailOAuth={handleGmailOAuth}
            handleTwitterOAuth={handleTwitterOAuth}
            handleFacebookOAuth={handleFacebookOAuth}
            handleInstagramOAuth={handleInstagramOAuth}
            handleLinkedInOAuth={handleLinkedInOAuth}
            handleTikTokOAuth={handleTikTokOAuth}
            handleKooOAuth={handleKooOAuth}
            handleShareChatOAuth={handleShareChatOAuth}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
