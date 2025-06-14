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
import { ComingSoonSection } from "./ComingSoonSection";
import { GitHubOAuthSection } from "./GitHubOAuthSection";
import { TwitterOAuthSection } from "./TwitterOAuthSection";
import { FacebookOAuthSection } from "./FacebookOAuthSection";
import { InstagramOAuthSection } from "./InstagramOAuthSection";
import { LinkedInOAuthSection } from "./LinkedInOAuthSection";
import { PlatformAuthFields } from "./PlatformAuthFields";

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
    isTwitterAuthing,
    isFacebookAuthing,
    isInstagramAuthing,
    isLinkedInAuthing,
    isSupported,
    handleConnect,
    handleClose,
    handleGitHubOAuth,
    handleTwitterOAuth,
    handleFacebookOAuth,
    handleInstagramOAuth,
    handleLinkedInOAuth,
  } = useConnectionDialog({ platform, onConnect, onClose });

  if (!platform) return null;

  const renderAuthFields = () => {
    if (!isSupported) {
      return <ComingSoonSection platformName={platform.name} />;
    }

    if (platform.id === "github") {
      return <GitHubOAuthSection />;
    }

    if (platform.id === "twitter") {
      return <TwitterOAuthSection credentials={credentials} setCredentials={setCredentials} />;
    }

    if (platform.id === "facebook") {
      return <FacebookOAuthSection credentials={credentials} setCredentials={setCredentials} />;
    }

    if (platform.id === "instagram") {
      return <InstagramOAuthSection credentials={credentials} setCredentials={setCredentials} />;
    }

    if (platform.id === "linkedin") {
      return <LinkedInOAuthSection credentials={credentials} setCredentials={setCredentials} />;
    }

    return <PlatformAuthFields platform={platform} credentials={credentials} setCredentials={setCredentials} />;
  };

  const renderConnectButton = () => {
    if (!isSupported) {
      return (
        <Button disabled>
          Coming Soon
        </Button>
      );
    }

    if (platform.id === "github") {
      return (
        <Button 
          onClick={handleGitHubOAuth} 
          disabled={isGitHubAuthing}
        >
          {isGitHubAuthing ? "Redirecting..." : "Connect with GitHub"}
        </Button>
      );
    }

    if (platform.id === "twitter") {
      return (
        <Button 
          onClick={handleTwitterOAuth} 
          disabled={isTwitterAuthing || !credentials.clientId || !credentials.clientSecret}
        >
          {isTwitterAuthing ? "Redirecting..." : "Connect with Twitter"}
        </Button>
      );
    }

    if (platform.id === "facebook") {
      return (
        <Button 
          onClick={handleFacebookOAuth} 
          disabled={isFacebookAuthing || !credentials.appId || !credentials.appSecret}
        >
          {isFacebookAuthing ? "Redirecting..." : "Connect with Facebook"}
        </Button>
      );
    }

    if (platform.id === "instagram") {
      return (
        <Button 
          onClick={handleInstagramOAuth} 
          disabled={isInstagramAuthing || !credentials.appId || !credentials.appSecret}
        >
          {isInstagramAuthing ? "Redirecting..." : "Connect with Instagram"}
        </Button>
      );
    }

    if (platform.id === "linkedin") {
      return (
        <Button 
          onClick={handleLinkedInOAuth} 
          disabled={isLinkedInAuthing || !credentials.clientId || !credentials.clientSecret}
        >
          {isLinkedInAuthing ? "Redirecting..." : "Connect with LinkedIn"}
        </Button>
      );
    }

    return (
      <Button 
        onClick={handleConnect} 
        disabled={isConnecting}
      >
        {isConnecting ? "Connecting..." : "Connect"}
      </Button>
    );
  };

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
          {renderAuthFields()}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          {renderConnectButton()}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
