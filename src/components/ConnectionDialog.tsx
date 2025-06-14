import { useState } from "react";
import { Platform } from "@/types/platform";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { isPlatformSupported } from "@/handlers/platformHandlers";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle } from "lucide-react";

interface ConnectionDialogProps {
  platform: Platform | null;
  isOpen: boolean;
  onClose: () => void;
  onConnect: (platformId: string, credentials: Record<string, string>) => Promise<boolean>;
}

export function ConnectionDialog({ platform, isOpen, onClose, onConnect }: ConnectionDialogProps) {
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const [isGitHubAuthing, setIsGitHubAuthing] = useState(false);
  const [isTwitterAuthing, setIsTwitterAuthing] = useState(false);
  const [isFacebookAuthing, setIsFacebookAuthing] = useState(false);

  if (!platform) return null;

  const isSupported = isPlatformSupported(platform.id);

  const handleConnect = async () => {
    if (!isSupported) {
      toast({
        title: "Coming Soon",
        description: `${platform.name} connection will be available in a future release.`,
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

  const renderTwitterOAuthFields = () => (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-800">Twitter OAuth 2.0 Setup</span>
        </div>
        <p className="text-sm text-blue-700 mb-3">
          You'll need your Twitter Developer App credentials. Get them from your Twitter Developer Dashboard.
        </p>
        <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
          <strong>Required Scopes:</strong> tweet.read, tweet.write, users.read, follows.read, follows.write, offline.access
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="clientId">Client ID</Label>
          <Input
            id="clientId"
            placeholder="Your Twitter App Client ID"
            value={credentials.clientId || ''}
            onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="clientSecret">Client Secret</Label>
          <Input
            id="clientSecret"
            type="password"
            placeholder="Your Twitter App Client Secret"
            value={credentials.clientSecret || ''}
            onChange={(e) => setCredentials({ ...credentials, clientSecret: e.target.value })}
          />
        </div>
      </div>
    </div>
  );

  const renderGitHubOAuthFields = () => (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-800">Connect with OAuth</span>
        </div>
        <p className="text-sm text-blue-700">
          You’ll be redirected to GitHub to approve access. When done, Yeti will securely save your tokens using Supabase.
        </p>
      </div>
    </div>
  );

  const renderFacebookOAuthFields = () => (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-blue-800">Facebook OAuth 2.0 Setup</span>
        </div>
        <p className="text-sm text-blue-700 mb-3">
          You'll need your Facebook App credentials from your Facebook Developer Dashboard.
        </p>
        <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
          <strong>Required Permissions:</strong> pages_manage_posts, pages_read_engagement, pages_show_list, pages_read_user_content, publish_to_groups
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <Label htmlFor="appId">App ID</Label>
          <Input
            id="appId"
            placeholder="Your Facebook App ID"
            value={credentials.appId || ''}
            onChange={(e) => setCredentials({ ...credentials, appId: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="appSecret">App Secret</Label>
          <Input
            id="appSecret"
            type="password"
            placeholder="Your Facebook App Secret"
            value={credentials.appSecret || ''}
            onChange={(e) => setCredentials({ ...credentials, appSecret: e.target.value })}
          />
        </div>
      </div>
    </div>
  );

  const renderAuthFields = () => {
    if (!isSupported) {
      return (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-amber-800">Coming Soon</span>
            </div>
            <p className="text-sm text-amber-700">
              {platform.name} integration is currently being developed and will be available in a future release. 
              We're working on bringing you the best possible connection experience.
            </p>
          </div>
        </div>
      );
    }

    if (platform.id === "github") {
      return renderGitHubOAuthFields();
    }

    if (platform.id === "twitter") {
      return renderTwitterOAuthFields();
    }

    if (platform.id === "facebook") {
      return renderFacebookOAuthFields();
    }

    switch (platform.authType) {
      case 'api-key':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Enter your API key"
                value={credentials.apiKey || ''}
                onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
              />
            </div>
            {platform.id === 'openai' && (
              <div>
                <Label htmlFor="organization">Organization ID (Optional)</Label>
                <Input
                  id="organization"
                  placeholder="org-xxxxxxxxx"
                  value={credentials.organization || ''}
                  onChange={(e) => setCredentials({ ...credentials, organization: e.target.value })}
                />
              </div>
            )}
          </div>
        );

      case 'credentials':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username/Email</Label>
              <Input
                id="username"
                placeholder="Enter username or email"
                value={credentials.username || ''}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={credentials.password || ''}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              />
            </div>
            {platform.id === 'wordpress' && (
              <div>
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  placeholder="https://yoursite.com"
                  value={credentials.siteUrl || ''}
                  onChange={(e) => setCredentials({ ...credentials, siteUrl: e.target.value })}
                />
              </div>
            )}
          </div>
        );

      case 'oauth':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Secure OAuth Connection</span>
              </div>
              <p className="text-sm text-blue-700">
                You'll be redirected to {platform.name} to authorize the connection.
                This is the secure way to connect without sharing your password.
              </p>
            </div>
            <div>
              <Label htmlFor="customConfig">Custom Configuration (Optional)</Label>
              <Textarea
                id="customConfig"
                placeholder="Any additional configuration in JSON format"
                value={credentials.customConfig || ''}
                onChange={(e) => setCredentials({ ...credentials, customConfig: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
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
          {isSupported ? (
            platform.id === "github" ? (
              <Button 
                onClick={handleGitHubOAuth} 
                disabled={isGitHubAuthing}
              >
                {isGitHubAuthing ? "Redirecting..." : "Connect with GitHub"}
              </Button>
            ) : platform.id === "twitter" ? (
              <Button 
                onClick={handleTwitterOAuth} 
                disabled={isTwitterAuthing || !credentials.clientId || !credentials.clientSecret}
              >
                {isTwitterAuthing ? "Redirecting..." : "Connect with Twitter"}
              </Button>
            ) : platform.id === "facebook" ? (
              <Button 
                onClick={handleFacebookOAuth} 
                disabled={isFacebookAuthing || !credentials.appId || !credentials.appSecret}
              >
                {isFacebookAuthing ? "Redirecting..." : "Connect with Facebook"}
              </Button>
            ) : (
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
              >
                {isConnecting ? "Connecting..." : "Connect"}
              </Button>
            )
          ) : (
            <Button disabled>
              Coming Soon
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
